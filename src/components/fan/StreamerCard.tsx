import LiveDot from '@/components/shared/LiveDot'

interface StreamerCardProps {
  displayName: string
}

export function StreamerCard({ displayName }: StreamerCardProps) {
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative overflow-hidden w-full rounded-xl bg-orange-dim border border-[var(--orb)] p-4 mb-5">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }}
      />
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 rounded-full bg-orange flex items-center justify-center text-white font-extrabold text-lg">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-[var(--t)] text-base truncate">{displayName}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <LiveDot />
            <span className="text-xs text-[var(--ts)]">Live · 2.4K watching</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StreamerCard
