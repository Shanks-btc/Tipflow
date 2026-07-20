import { createServiceRoleClient } from './supabase-server'

export interface StreamerStats {
  totalEarned: number
  thisMonth: number
  avgTip: number
  tipCount: number
}

// Demo fallback streamers (see MOCK_STREAMERS in streamers.ts) have no real
// rows in the tips table — querying by their fake id would just come back
// empty, so skip the round-trip and return zeros directly.
export async function getStreamerStats(streamerId: string): Promise<StreamerStats> {
  if (streamerId.startsWith('mock-')) {
    return { totalEarned: 0, thisMonth: 0, avgTip: 0, tipCount: 0 }
  }

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('tips')
    .select('amount_usd, created_at')
    .eq('streamer_id', streamerId)
    .eq('status', 'confirmed')

  const tips = data ?? []
  const totalEarned = tips.reduce((sum, t) => sum + Number(t.amount_usd), 0)

  const now = new Date()
  const thisMonth = tips
    .filter((t) => {
      const d = new Date(t.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, t) => sum + Number(t.amount_usd), 0)

  const avgTip = tips.length ? totalEarned / tips.length : 0

  return { totalEarned, thisMonth, avgTip, tipCount: tips.length }
}
