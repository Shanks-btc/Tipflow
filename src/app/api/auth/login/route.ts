import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'

// MVP shortcut, not hardened auth: trusts the client-resolved Magic address
// rather than cryptographically verifying a DID token server-side (that
// needs @magic-sdk/admin, not installed). Good enough to demo the
// protected-route pattern and qualify the OTP flow for the Magic bonus;
// revisit with real DID verification before this touches real user funds
// beyond the hackathon demo.
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { address, email } = body as { address?: string; email?: string }

  if (!address || !email) {
    return NextResponse.json({ error: 'Missing address or email' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const { data: streamer } = await supabase
    .from('streamers')
    .select('id, username')
    .eq('email', email)
    .single()

  const cookieStore = cookies()
  cookieStore.set('tipflow_session', address, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ exists: !!streamer, username: streamer?.username ?? null })
}
