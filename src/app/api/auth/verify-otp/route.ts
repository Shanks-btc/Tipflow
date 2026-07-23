import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { deriveWalletFromEmail } from '@/lib/walletDerivation'

export async function POST(req: Request) {
  const { email, code } = await req.json()
  if (!email || !code) return NextResponse.json({ error: 'Email and code required' }, { status: 400 })

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  // Mark code as used
  await supabase.from('otp_codes').update({ used: true }).eq('id', data.id)

  // Deterministic wallet, derived server-side from a dedicated secret
  // (WALLET_DERIVATION_SECRET) + the normalized email — never from public
  // data alone. See lib/walletDerivation.ts for why that distinction
  // matters (a derivation with no secret input is fully reconstructable by
  // anyone who learns the email, which is not meant to be sensitive).
  const wallet = deriveWalletFromEmail(email)

  // Set session cookie
  const cookieStore = cookies()
  cookieStore.set('tipflow_session', wallet.address, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Check if streamer exists
  const { data: streamer } = await supabase.from('streamers').select('username').eq('email', email).single()

  return NextResponse.json({
    success: true,
    address: wallet.address,
    redirect: streamer ? '/dashboard' : `/setup?email=${encodeURIComponent(email)}`,
  })
}
