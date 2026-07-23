import { getSessionStreamer } from '@/lib/streamers'
import { getStreamerStats } from '@/lib/tips'
import { createServiceRoleClient } from '@/lib/supabase-server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import ProfileCard from '@/components/dashboard/ProfileCard'
import QuickStats from '@/components/dashboard/QuickStats'
import StatCard from '@/components/dashboard/StatCard'
import BalanceCard from '@/components/dashboard/BalanceCard'
import TipLinkCard from '@/components/dashboard/TipLinkCard'
import OverlayCard from '@/components/dashboard/OverlayCard'
import TipTable from '@/components/dashboard/TipTable'

// alert_duration/min_tip_amount live on the streamers row (see
// supabase/migrations/003_streamer_settings.sql) but are queried separately
// from getSessionStreamer() — if that migration hasn't been applied yet in
// a given environment, this query fails in isolation and falls back to
// defaults instead of breaking the whole dashboard.
async function getStreamerSettings(streamerId: string): Promise<{ alertDuration: number; minTipAmount: number }> {
  const defaults = { alertDuration: 5, minTipAmount: 1 }
  if (streamerId.startsWith('mock-')) return defaults

  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('streamers').select('alert_duration, min_tip_amount').eq('id', streamerId).single()

  return {
    alertDuration: data?.alert_duration ?? defaults.alertDuration,
    minTipAmount: data?.min_tip_amount ?? defaults.minTipAmount,
  }
}

// Route protection itself is handled by middleware.ts (redirects to /login
// if no tipflow_session cookie). getSessionStreamer() reads that same
// cookie server-side to resolve the signed-in streamer's row directly —
// same pattern as the tip page's getStreamerByUsername(), avoiding a
// client round-trip to GET /api/auth/session (which exists too, for
// client-side callers, and shares this exact lookup).
export default async function DashboardPage() {
  const { streamer } = await getSessionStreamer()
  const stats = await getStreamerStats(streamer.id)
  const { alertDuration, minTipAmount } = await getStreamerSettings(streamer.id)

  return (
    <main className="min-h-screen bg-bg">
      <DashboardNav
        username={streamer.username}
        displayName={streamer.display_name}
        alertDuration={alertDuration}
        minTipAmount={minTipAmount}
      />

      <div className="max-w-[960px] mx-auto p-4 sm:p-6">
        <ProfileCard
          displayName={streamer.display_name}
          username={streamer.username}
          alertDuration={alertDuration}
          minTipAmount={minTipAmount}
        />

        <QuickStats streamerId={streamer.id} />

        <BalanceCard ownerAddress={streamer.ua_address} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-4">
            <TipLinkCard username={streamer.username} />
            <OverlayCard username={streamer.username} />
          </div>
          <div className="hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard
            label="Total earned"
            value={`$${stats.totalEarned.toFixed(2)}`}
            sub={`${stats.tipCount} tip${stats.tipCount === 1 ? '' : 's'}`}
            stripeGradient="linear-gradient(90deg, #FBBF24, #F97316)"
          />
          <StatCard
            label="This month"
            value={`$${stats.thisMonth.toFixed(2)}`}
            stripeGradient="linear-gradient(90deg, #F97316, #FB923C)"
          />
          <StatCard
            label="Avg tip"
            value={`$${stats.avgTip.toFixed(2)}`}
            stripeGradient="linear-gradient(90deg, #34D399, #059669)"
          />
        </div>

        <TipTable streamerId={streamer.id} username={streamer.username} />
      </div>
    </main>
  )
}
