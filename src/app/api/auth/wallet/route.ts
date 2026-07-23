import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createServiceRoleClient } from '@/lib/supabase-server'
import { deriveWalletFromEmail, deriveWalletFromUserId } from '@/lib/walletDerivation'

// Returns the caller's own deterministic wallet — never accepts a
// client-supplied id or email. Two auth paths currently coexist in this
// app, so this checks both, strongest proof first:
//
// 1. A live Supabase Auth session (the fan tip flow, useMagicAuth.ts,
//    which still uses supabase.auth.signInWithOtp/verifyOtp) — wallet
//    derived from the verified session's user id.
// 2. Our own tipflow_session cookie (httpOnly, set only by
//    api/auth/verify-otp after a real code check) — used by the
//    Resend-based streamer login, which never creates a Supabase Auth
//    session at all. Since that cookie only stores a wallet address, not
//    an email, the email is recovered via the streamers table (populated
//    by api/auth/setup) and the wallet re-derived from it.
//
// Both branches end up calling into lib/walletDerivation.ts's
// HMAC(WALLET_DERIVATION_SECRET, ...) construction — just keyed
// differently (user id vs email), since the two auth paths have no common
// identifier to derive from. See deriveWalletFromEmail's comment for why
// that means the same person can currently get two different wallets
// depending on which flow they used.
export async function POST() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    const wallet = deriveWalletFromUserId(data.user.id)
    return NextResponse.json({ address: wallet.address, privateKey: wallet.privateKey })
  }

  const sessionAddress = cookies().get('tipflow_session')?.value
  if (!sessionAddress) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const supabaseAdmin = createServiceRoleClient()
  const { data: streamer } = await supabaseAdmin
    .from('streamers')
    .select('email')
    .ilike('ua_address', sessionAddress)
    .single()

  if (!streamer?.email) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const wallet = deriveWalletFromEmail(streamer.email)
  return NextResponse.json({ address: wallet.address, privateKey: wallet.privateKey })
}
