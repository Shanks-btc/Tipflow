import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createServiceRoleClient } from '@/lib/supabase-server'
import { deriveWalletFromEmail, deriveWalletFromUserId } from '@/lib/walletDerivation'

// Returns the caller's own deterministic wallet — never accepts a
// client-supplied id or email.
//
// The fan tip flow no longer reaches this route at all: useMagicAuth.ts's
// verifyOTP() now gets the wallet directly from api/auth/verify-otp's
// response (the same Resend-based OTP system streamers use), since that
// endpoint never creates a Supabase Auth session either. So branch 1
// below (a live Supabase Auth session) currently has no live caller in
// this app — kept rather than deleted since api/auth/login/route.ts
// still targets it and nothing here depends on removing it. The only
// active caller today is branch 2: our own tipflow_session cookie
// (httpOnly, set only by api/auth/verify-otp after a real code check),
// used by the streamer dashboard's withdrawal flow (WithdrawModal.tsx via
// getAddress()/getSigner()). Since that cookie only stores a wallet
// address, not an email, the email is recovered via the streamers table
// (populated by api/auth/setup) and the wallet re-derived from it.
//
// Both branches end up calling into lib/walletDerivation.ts's
// HMAC(WALLET_DERIVATION_SECRET, ...) construction — just keyed
// differently (user id vs email).
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
