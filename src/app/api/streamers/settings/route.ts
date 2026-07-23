import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'

// Identity comes from the tipflow_session cookie (the signed-in streamer's
// ua_address), never from the request body — same pattern as
// /api/streamers/[username] and /api/auth/setup, so a caller can only ever
// update their own row.
export async function PATCH(request: NextRequest) {
  const address = cookies().get('tipflow_session')?.value
  if (!address) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const body = await request.json()
  const { display_name, alert_duration, min_tip_amount } = body as {
    display_name?: string
    alert_duration?: number
    min_tip_amount?: number
  }

  const updates: Record<string, unknown> = {}
  if (typeof display_name === 'string' && display_name.trim()) updates.display_name = display_name.trim()
  if (typeof alert_duration === 'number' && alert_duration > 0) updates.alert_duration = alert_duration
  if (typeof min_tip_amount === 'number' && min_tip_amount > 0) updates.min_tip_amount = min_tip_amount

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const { data: streamer } = await supabase.from('streamers').select('id').ilike('ua_address', address).single()

  if (!streamer) {
    return NextResponse.json({ error: 'Streamer not found' }, { status: 404 })
  }

  const { error } = await supabase.from('streamers').update(updates).eq('id', streamer.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
