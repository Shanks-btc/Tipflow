'use client'
import { useCallback, useRef, useState } from 'react'
import type { Wallet } from 'ethers'
import { getMagic, getMagicBare, createMagicSigner } from '@/lib/magic'
import { getOrCreatePersistedTestWallet, clearPersistedTestWallet, createTestWalletSigner } from '@/lib/testWalletSigner'
import { ARBITRUM_CHAIN_ID } from '@/lib/constants'
import type { TipSigner } from '@/lib/tipSigner'

// The in-flight loginWithEmailOTP() handle. Magic's custom-UI OTP flow keeps
// a single event-driven promise open between sendOTP() (which starts it) and
// verifyOTP() (which later emits the code into the same handle) — it cannot
// be re-created per call, so it lives in a ref across the two steps.
type OTPHandle = ReturnType<ReturnType<typeof getMagicBare>['auth']['loginWithEmailOTP']>
type ProgressFn = (message: string) => void

const OTP_SEND_TIMEOUT_MS = 15_000

// TEMPORARY dev-only fallback (localhost only — see isLocalhost below).
// Module-level, not a useRef: a ref only survives for as long as the
// specific component instance that created it stays mounted. This must
// survive regardless of any remount/Fast-Refresh churn during the 15s
// wait, so it lives at module scope — same pattern as the magic/magicBare
// singletons in lib/magic.ts. The wallet itself is additionally persisted
// in localStorage (see testWalletSigner.ts) so it's the SAME wallet across
// full page reloads too, not just React remounts — this in-memory variable
// is just a per-load cache of whatever getOrCreatePersistedTestWallet()
// last returned.
let fallbackWallet: Wallet | null = null

// Distinguishes a timeout from every other sendOTP failure (invalid email,
// Magic returning a real error, etc.) so the localhost fallback below only
// triggers on "Magic never responded," never on a genuine rejection.
class MagicTimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new MagicTimeoutError(timeoutMessage)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function useMagicAuth() {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [fallbackAddress, setFallbackAddress] = useState<string | null>(null)
  const [fallbackPrivateKey, setFallbackPrivateKey] = useState<string | null>(null)
  const otpHandleRef = useRef<OTPHandle | null>(null)

  // Auth-only Magic instance (no EVM extension) — the extension isn't
  // needed for login and keeping it out of this path means the auth flow
  // never depends on EVM extension state.
  const sendOTP = useCallback(async (email: string, onProgress?: ProgressFn): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const apiKey = process.env.NEXT_PUBLIC_MAGIC_API_KEY ?? ''
      onProgress?.(
        `Magic init check (auth-only mode) — key: ${apiKey || '(MISSING)'} (${apiKey.length} chars, expected 40+)`
      )

      const magic = getMagicBare()
      onProgress?.('Magic SDK instance ready — calling magic.auth.loginWithEmailOTP()…')

      await withTimeout(
        new Promise<void>((resolve, reject) => {
          const handle = magic.auth.loginWithEmailOTP({ email, showUI: false })
          otpHandleRef.current = handle
          onProgress?.('loginWithEmailOTP() call issued — waiting for Magic to respond…')

          handle.on('email-otp-sent', () => {
            onProgress?.('email-otp-sent event received — code is on its way')
            resolve()
          })
          handle.on('invalid-email-otp', () => reject(new Error('Invalid code. Please try again.')))
          handle.on('expired-email-otp', () => reject(new Error('That code expired. Request a new one.')))
          handle.on('error', (reason: unknown) => reject(reason))
          handle.catch(reject)
        }),
        OTP_SEND_TIMEOUT_MS,
        `Timed out after ${OTP_SEND_TIMEOUT_MS / 1000}s waiting for Magic to respond — no email-otp-sent ` +
          `or error event ever fired. This almost always means NEXT_PUBLIC_MAGIC_API_KEY is invalid, revoked, ` +
          `or not registered for this domain in dashboard.magic.link → Settings → Allowed Origins.`
      )
      onProgress?.('sendOTP() resolved — email-otp-sent confirmed')
    } catch (err) {
      if (err instanceof MagicTimeoutError && isLocalhost()) {
        // Reuses the same wallet across reloads (persisted in localStorage)
        // instead of generating a new one every time — see testWalletSigner.ts.
        const wallet = getOrCreatePersistedTestWallet()
        fallbackWallet = wallet
        // eslint-disable-next-line no-console -- intentional dev-visible signal, not app logging
        console.warn(`[Tipflow DEV] Magic timed out — using persisted local fallback wallet: ${wallet.address}`)
        onProgress?.(
          `Magic timed out — localhost dev fallback: using persisted local test wallet ${wallet.address}. ` +
            'This never happens in production (only on localhost/127.0.0.1).'
        )
        setUsingFallback(true)
        setFallbackAddress(wallet.address)
        setFallbackPrivateKey(wallet.privateKey)
        setError(null)
        setLoading(false)
        return
      }
      const message = err instanceof Error ? err.message : 'Failed to send the login code'
      setError(message)
      onProgress?.(`Error caught in sendOTP(): ${message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyOTP = useCallback(async (otp: string, onProgress?: ProgressFn): Promise<string> => {
    // Dev fallback path — no real OTP exists to check, so any 6-digit
    // input the UI already validated is accepted. Reads the module-level
    // wallet directly rather than trusting component state to have caught
    // up.
    if (fallbackWallet) {
      const address = fallbackWallet.address
      onProgress?.(`Fallback mode — skipping real verification, using local wallet ${address}`)
      setAddress(address)
      return address
    }

    const handle = otpHandleRef.current
    if (!handle) throw new Error('No login in progress — request a code first')
    setLoading(true)
    setError(null)
    try {
      onProgress?.('Emitting verify-email-otp…')
      const idToken = await new Promise<string | null>((resolve, reject) => {
        handle.on('invalid-email-otp', () => reject(new Error('Invalid code. Please try again.')))
        handle.on('expired-email-otp', () => reject(new Error('That code expired. Request a new one.')))
        handle.on('done', (result: string | null) => resolve(result))
        handle.on('error', (reason: unknown) => reject(reason))
        handle.emit('verify-email-otp', otp)
      })
      onProgress?.('verify-email-otp resolved — fetching wallet address…')
      if (!idToken) throw new Error('Login failed — Magic did not return a session token')

      // Read the address off the same auth-only instance that logged in.
      // Magic's session lives in its relayer iframe keyed to the API key,
      // not this JS object, so getMagic() (Mode B, with the EVM extension)
      // sees the same logged-in session once constructed later for signing.
      const magic = getMagicBare()
      const metadata = await magic.user.getInfo()
      const publicAddress = metadata?.wallets?.ethereum?.publicAddress
      if (!publicAddress) throw new Error('Login succeeded but no wallet address was returned')

      setAddress(publicAddress)
      otpHandleRef.current = null
      onProgress?.(`verifyOTP() resolved — address: ${publicAddress}`)
      return publicAddress
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify the code'
      setError(message)
      onProgress?.(`Error caught in verifyOTP(): ${message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAddress = useCallback(async (): Promise<string> => {
    if (fallbackWallet) return fallbackWallet.address
    const magic = getMagicBare()
    const metadata = await magic.user.getInfo()
    const publicAddress = metadata?.wallets?.ethereum?.publicAddress
    if (!publicAddress) throw new Error('No Magic wallet address available — log in first')
    setAddress(publicAddress)
    return publicAddress
  }, [])

  // EIP-7702 signing needs the EVM-extended instance (Mode B) — only
  // constructed here, after login, never during the OTP flow above.
  const sign7702 = useCallback(
    async (contractAddress: string, chainId: number = ARBITRUM_CHAIN_ID, nonce?: number) => {
      const magic = getMagic()
      return magic.wallet.sign7702Authorization({
        contractAddress,
        chainId,
        ...(nonce !== undefined && { nonce }),
      })
    },
    []
  )

  // Returns the right TipSigner for whichever path logged the fan in —
  // real Magic, or the localhost-only fallback wallet. Checks the
  // module-level fallback wallet before anything else. Callers (TipCard,
  // useTipFlow) don't need to know which one is active.
  const getSigner = useCallback((): TipSigner => {
    if (fallbackWallet) return createTestWalletSigner(fallbackWallet)
    if (!address) throw new Error('No signer available — log in first')
    return createMagicSigner(getMagic(), address)
  }, [address])

  const logout = useCallback(async () => {
    if (!fallbackWallet) {
      const magic = getMagicBare()
      await magic.user.logout()
    }
    // Clears only the in-memory cache for this load — the persisted
    // wallet in localStorage is untouched, so the next fallback trigger
    // reuses the same identity. Use clearFallbackWallet() to actually
    // delete it.
    fallbackWallet = null
    setUsingFallback(false)
    setFallbackAddress(null)
    setFallbackPrivateKey(null)
    setAddress(null)
    otpHandleRef.current = null
  }, [])

  // Explicit-only — never called automatically. Deletes the persisted dev
  // wallet from localStorage so the next fallback trigger generates a
  // brand new one.
  const clearFallbackWallet = useCallback(() => {
    clearPersistedTestWallet()
    fallbackWallet = null
    setUsingFallback(false)
    setFallbackAddress(null)
    setFallbackPrivateKey(null)
  }, [])

  return {
    sendOTP,
    verifyOTP,
    getAddress,
    getSigner,
    sign7702,
    logout,
    clearFallbackWallet,
    loading,
    address,
    error,
    usingFallback,
    fallbackAddress,
    fallbackPrivateKey,
  }
}
