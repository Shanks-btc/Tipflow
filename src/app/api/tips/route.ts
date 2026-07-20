import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { streamerId, fanEmail, amountUsd, message, txHash, sourceChain } = body as {
    streamerId?: string
    fanEmail?: string
    amountUsd?: number
    message?: string
    txHash?: string
    sourceChain?: string
  }

  if (!streamerId || !amountUsd || !txHash) {
    return NextResponse.json({ error: 'Missing required fields: streamerId, amountUsd, txHash' }, { status: 400 })
  }

  // Demo streamers from the GET /api/streamers mock fallback aren't real
  // Supabase rows (no onboarding flow exists yet) — skip the insert rather
  // than violate the streamers_id foreign key. The on-chain tip already
  // succeeded regardless of whether it gets recorded here.
  if (streamerId.startsWith('mock-')) {
    return NextResponse.json({ id: null, status: 'confirmed' })
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('tips')
    .insert({
      streamer_id: streamerId,
      fan_email: fanEmail ?? null,
      amount_usd: amountUsd,
      message: message || null,
      tx_hash: txHash,
      source_chain: sourceChain ?? null,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, status: 'confirmed' })
}
