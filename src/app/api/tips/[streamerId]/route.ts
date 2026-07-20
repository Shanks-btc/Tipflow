import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: { streamerId: string } }) {
  const { streamerId } = params

  // Demo fallback streamers (see MOCK_STREAMERS in streamers.ts) have no
  // real rows in Supabase — nothing to query.
  if (streamerId.startsWith('mock-')) {
    return NextResponse.json([])
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('tips')
    .select('id, fan_email, amount_usd, message, tx_hash, source_chain, status, created_at')
    .eq('streamer_id', streamerId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
