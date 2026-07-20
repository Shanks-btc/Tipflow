'use client'
import { useCallback, useState } from 'react'
import { JsonRpcProvider, Wallet } from 'ethers'
import { createClient } from '@/lib/supabase'
import { createUserSigner } from '@/lib/magic'
import { ARBITRUM_RPC } from '@/lib/constants'
import type { TipSigner } from '@/lib/tipSigner'

// Module-level, not useState/useRef: must survive remounts within a page
// load, same reasoning as the magic/magicBare singletons this replaced.
// Deliberately NOT persisted to localStorage or sessionStorage — this
// holds a real production private key (unlike the old dev-only fallback
// wallet in testWalletSigner.ts, which is explicitly test-funds-only and
// shown to the user with a "never use in production" warning). It only
// ever lives in memory for the current page load; a fresh load re-fetches
// it from the server, authenticated via the live Supabase session.
let cachedWallet: Wallet | null = null

export function useMagicAuth() {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sendOTP = useCallback(async (email: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      // emailRedirectTo is intentionally omitted (not merely undefined —
      // see below) so Supabase has no confirmation link to build from the
      // client side. That alone doesn't guarantee a code-only email: the
      // active email template in the Supabase dashboard is what actually
      // decides whether {{ .ConfirmationURL }} (a link) or {{ .Token }}
      // (the 6-digit code) gets shown — see Authentication → Email
      // Templates. A template referencing .ConfirmationURL will still
      // render a link even with no emailRedirectTo here, because Supabase
      // falls back to the project's configured Site URL.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpError) throw new Error(otpError.message)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send the login code'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetches the caller's deterministic wallet from the server (see
  // api/auth/wallet/route.ts) — the private key is derived there from a
  // server-only secret plus the user's id, never from public data alone,
  // and the endpoint only ever returns the caller's own wallet (verified
  // via their live Supabase session), never one requested by id.
  const fetchWallet = useCallback(async (): Promise<Wallet> => {
    if (cachedWallet) return cachedWallet
    const res = await fetch('/api/auth/wallet', { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string })
      throw new Error(body.error || 'Failed to load your wallet — please sign in again')
    }
    const { privateKey } = (await res.json()) as { address: string; privateKey: string }
    const provider = new JsonRpcProvider(ARBITRUM_RPC)
    cachedWallet = new Wallet(privateKey, provider)
    return cachedWallet
  }, [])

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      if (verifyError) throw new Error(verifyError.message)
      if (!data.user) throw new Error('Login failed — no user returned')

      const wallet = await fetchWallet()
      setAddress(wallet.address)
      return wallet.address
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify the code'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchWallet])

  const getAddress = useCallback(async (): Promise<string> => {
    const wallet = await fetchWallet()
    setAddress(wallet.address)
    return wallet.address
  }, [fetchWallet])

  const getSigner = useCallback((): TipSigner => {
    if (!cachedWallet) throw new Error('No signer available — log in first')
    return createUserSigner(cachedWallet)
  }, [])

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    cachedWallet = null
    setAddress(null)
    setError(null)
  }, [])

  return { sendOTP, verifyOTP, getAddress, getSigner, logout, loading, address, error }
}
