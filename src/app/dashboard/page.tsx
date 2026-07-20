import { getSessionStreamer } from '@/lib/streamers'
import { getStreamerStats } from '@/lib/tips'
import StatCard from '@/components/dashboard/StatCard'
import BalanceCard from '@/components/dashboard/BalanceCard'
import TipLinkCard from '@/components/dashboard/TipLinkCard'
import OverlayCard from '@/components/dashboard/OverlayCard'
import TipFeed from '@/components/dashboard/TipFeed'

// Route protection itself is handled by middleware.ts (redirects to /login
// if no tipflow_session cookie). getSessionStreamer() reads that same
// cookie server-side to resolve the signed-in streamer's row directly —
// same pattern as the tip page's getStreamerByUsername(), avoiding a
// client round-trip to GET /api/auth/session (which exists too, for
// client-side callers, and shares this exact lookup).
export default async function DashboardPage() {
  const { streamer, isDemo } = await getSessionStreamer()
  const stats = await getStreamerStats(streamer.id)

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-[960px] mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-[var(--t)]">{streamer.display_name}</h1>
          <p className="text-sm text-[var(--ts)]">@{streamer.username}</p>
          {isDemo && (
            <span className="inline-block mt-2 bg-orange-dim border border-[var(--orb)] text-orange rounded-full px-2.5 py-1 text-[11px] uppercase">
              Demo data — log in to see your own dashboard
            </span>
          )}
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

        <BalanceCard ownerAddress={streamer.ua_address} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TipLinkCard username={streamer.username} />
          <OverlayCard username={streamer.username} />
        </div>

        <TipFeed streamerId={streamer.id} />
      </div>
    </main>
  )
}
