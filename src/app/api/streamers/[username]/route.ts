import { NextRequest, NextResponse } from 'next/server'
import { getStreamerByUsername } from '@/lib/streamers'

export async function GET(_request: NextRequest, { params }: { params: { username: string } }) {
  const streamer = await getStreamerByUsername(params.username)
  if (!streamer) {
    return NextResponse.json({ error: 'Streamer not found' }, { status: 404 })
  }
  return NextResponse.json(streamer)
}
