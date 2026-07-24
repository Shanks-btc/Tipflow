'use client'
import { useCallback, useState } from 'react'
import { JsonRpcProvider, Wallet } from 'ethers'
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
// it from the server, authenticated either by a just-verified OTP code
// (verifyOTP, the fan flow) or an existing session (fetchWallet, used by
// the streamer dashboard's withdrawal flow).
let cachedWallet: Wallet | null = null

export function useMagicAuth() {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Uses the same Resend-based OTP system as the streamer login flow
  // (api/auth/send-otp, api/auth/verify-otp) — Supabase's own built-in
  // email OTP (supabase.auth.signInWithOtp) has broken SMTP in this
  // project and reliably 500s, which is what was surfacing as the "{}"
  // error on the tip page (a failed-request object rendered straight into
  // JSX). Fans still have to prove they own the email they type in before
  // their deterministic wallet's private key is handed back — that proof
  // is what makes it safe to let this wallet sign a real on-chain
  // transaction; nothing here removes that check, it just fixes what was
  // actually sending it.
  const sendOTP = useCallback(async (email: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send the login code')
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
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to verify the code')

      const provider = new JsonRpcProvider(ARBITRUM_RPC)
      cachedWallet = new Wallet(data.privateKey, provider)
      setAddress(data.address)
      return data.address
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify the code'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    cachedWallet = null
    setAddress(null)
    setError(null)
  }, [])

  return { sendOTP, verifyOTP, getAddress, getSigner, logout, loading, address, error }
}
