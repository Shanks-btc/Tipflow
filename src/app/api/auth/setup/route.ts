import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'

const USERNAME_PATTERN = /^[a-z0-9-]+$/i

// Best-effort — the streamer row is already saved by the time this runs,
// so a webhook/network hiccup here must never fail the setup request
// itself (that would 500 a request that actually succeeded, and a retry
// would then hit "username already taken"). No-ops until ALCHEMY_WEBHOOK_ID
// and ALCHEMY_API_KEY are set (Railway env vars, not added yet).
async function addToAlchemyWebhook(address: string): Promise<void> {
  const webhookId = process.env.ALCHEMY_WEBHOOK_ID
  const apiKey = process.env.ALCHEMY_API_KEY

  if (!webhookId || !apiKey) return

  try {
    const res = await fetch('https://dashboard.alchemy.com/api/update-webhook-addresses', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Alchemy-Token': apiKey,
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        addresses_to_add: [address],
        addresses_to_remove: [],
      }),
    })
    if (!res.ok) {
      console.error('Alchemy webhook update failed:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('Alchemy webhook update failed:', err)
  }
}

// /api/auth/login never creates a streamers row on first login (it only
// checks `exists` by email) — this is where that row actually gets
// created, the first time someone completes the setup wizard. ua_address
// is the identity key throughout the app (see getSessionStreamer in
// lib/streamers.ts), so an existing row is found by matching the session
// cookie's address rather than by username.
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, email } = body as { username?: string; email?: string }

  if (!username || !USERNAME_PATTERN.test(username)) {
    return NextResponse.json({ error: 'Invalid username — letters, numbers, and hyphens only' }, { status: 400 })
  }

  const address = cookies().get('tipflow_session')?.value
  if (!address) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const normalizedUsername = username.toLowerCase()
  const supabase = createServiceRoleClient()

  const { data: takenBy } = await supabase
    .from('streamers')
    .select('id, ua_address')
    .eq('username', normalizedUsername)
    .single()

  if (takenBy && takenBy.ua_address.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }

  const { data: existing } = await supabase
    .from('streamers')
    .select('id')
    .ilike('ua_address', address)
    .single()

  // streamers.email is NOT NULL in the actual Supabase schema — only
  // matters for the insert path below (an existing row already has one).
  if (!existing && !email) {
    return NextResponse.json({ error: 'Missing email — please sign in again from /login' }, { status: 400 })
  }

  const { error } = existing
    ? await supabase.from('streamers').update({ username: normalizedUsername }).eq('id', existing.id)
    : await supabase.from('streamers').insert({
        username: normalizedUsername,
        display_name: normalizedUsername,
        ua_address: address,
        email,
      })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await addToAlchemyWebhook(address)

  return NextResponse.json({ success: true })
}
