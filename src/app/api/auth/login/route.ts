import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createServiceRoleClient } from '@/lib/supabase-server'
import { deriveWalletFromUserId } from '@/lib/walletDerivation'

// Verifies the caller against their live Supabase session (set by
// supabase.auth.verifyOtp() on the client just before this is called) —
// no client-supplied address or email is trusted. The session's user id
// is the only input to both the wallet address (same deterministic
// derivation as /api/auth/wallet) and the streamer lookup (via the
// session's own verified email), so this can only ever act on the
// caller's own identity.
export async function POST() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { address } = deriveWalletFromUserId(data.user.id)
  const email = data.user.email

  const supabaseAdmin = createServiceRoleClient()
  const { data: streamer } = email
    ? await supabaseAdmin.from('streamers').select('id, username').eq('email', email).single()
    : { data: null }

  const cookieStore = cookies()
  cookieStore.set('tipflow_session', address, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ exists: !!streamer, username: streamer?.username ?? null })
}
