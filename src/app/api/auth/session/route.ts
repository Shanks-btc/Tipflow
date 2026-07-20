import { NextResponse } from 'next/server'
import { getSessionStreamer } from '@/lib/streamers'

export async function GET() {
  const { streamer, isDemo } = await getSessionStreamer()
  return NextResponse.json({ authenticated: !isDemo, streamer, isDemo })
}
