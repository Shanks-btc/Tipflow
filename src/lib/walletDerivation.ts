import { createHmac } from 'crypto'
import { Mnemonic, Wallet } from 'ethers'

// Server-only — this file must never be imported by client code (no
// 'use client' consumers, no import from src/hooks/*).
//
// SECURITY: a naive "derive the wallet from the Supabase user id" scheme
// (e.g. Wallet.fromPhrase(Mnemonic.entropyToPhrase(getBytes(id(userId)))))
// is a critical vulnerability, not a simplification. Supabase user ids are
// not secret — they appear in JWT payloads sent to the browser, in API
// responses, in admin dashboards. A derivation with no secret input means
// anyone who ever learns a user's id (which is by design not sensitive)
// can compute that exact same private key offline and drain their wallet.
// This differs from that scheme in exactly one way: entropy is HMAC'd
// against WALLET_DERIVATION_SECRET, a value that only ever exists in this
// server process's environment and is never sent to the client. Without
// it, the user id alone is not enough to reconstruct the wallet.
//
// This is still a shared-secret custodial scheme, not true MPC/HSM
// custody (Magic's actual security model) — if WALLET_DERIVATION_SECRET
// ever leaks, every user's wallet is compromised at once. Protect it
// exactly like a database root password: strong random value, set only in
// the server's environment (Railway → Variables), never logged, never
// committed, rotated via a real key-rotation plan if it's ever suspected
// of leaking.
// Wallet.fromPhrase() actually returns ethers' HDNodeWallet (a Wallet
// subclass with HD-derivation-path fields that aren't assignable to the
// plain Wallet type) — callers here only need the two string fields, so
// returning them directly sidesteps that class-hierarchy mismatch rather
// than fighting it with a cast.
export function deriveWalletFromUserId(userId: string): { address: string; privateKey: string } {
  const secret = process.env.WALLET_DERIVATION_SECRET
  if (!secret) {
    throw new Error('WALLET_DERIVATION_SECRET is not set in the server environment')
  }
  const entropy = createHmac('sha256', secret).update(userId).digest()
  const mnemonic = Mnemonic.entropyToPhrase(entropy)
  const wallet = Wallet.fromPhrase(mnemonic)
  return { address: wallet.address, privateKey: wallet.privateKey }
}
