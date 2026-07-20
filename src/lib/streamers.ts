import { cookies } from 'next/headers'
import { createServiceRoleClient } from './supabase-server'

export interface Streamer {
  id: string
  username: string
  display_name: string
  ua_address: string
  avatar_url: string | null
}

// Demo fallback — no streamer onboarding flow exists yet (that's Phase 6),
// so there are no real rows in Supabase for most usernames. This keeps
// /tip/nightowl working end to end using the Arbitrum address already
// verified on mainnet.
const MOCK_STREAMERS: Record<string, Streamer> = {
  nightowl: {
    id: 'mock-nightowl',
    username: 'nightowl',
    display_name: 'Nightowl',
    ua_address: '0x9Fe8f5497180976FceFee773Dd5778dB73E01047',
    avatar_url: null,
  },
}

// Server-only — used directly by the tip page's Server Component (avoids a
// client round-trip to its own API route) and by GET /api/streamers/[username].
export async function getStreamerByUsername(usernameRaw: string): Promise<Streamer | null> {
  const username = usernameRaw.toLowerCase()
  const supabase = createServiceRoleClient()

  const { data } = await supabase
    .from('streamers')
    .select('id, username, display_name, ua_address, avatar_url')
    .eq('username', username)
    .single()

  if (data) return data as Streamer

  return MOCK_STREAMERS[username] ?? null
}

// The dashboard's identity source: tipflow_session (set by /api/auth/login)
// holds the signed-in Magic address, not an email — so this looks the
// streamer up by ua_address (ilike for a case-insensitive exact match,
// since Magic returns checksummed addresses and Supabase storage casing
// isn't guaranteed to match). Falls back to the same nightowl demo row
// used by the tip page when there's no session or no matching streamer,
// so /dashboard is always viewable even before onboarding (Phase 6) exists.
export async function getSessionStreamer(): Promise<{ streamer: Streamer; isDemo: boolean }> {
  const sessionAddress = cookies().get('tipflow_session')?.value

  if (sessionAddress) {
    const supabase = createServiceRoleClient()
    const { data } = await supabase
      .from('streamers')
      .select('id, username, display_name, ua_address, avatar_url')
      .ilike('ua_address', sessionAddress)
      .single()

    if (data) return { streamer: data as Streamer, isDemo: false }
  }

  return { streamer: MOCK_STREAMERS.nightowl, isDemo: true }
}
