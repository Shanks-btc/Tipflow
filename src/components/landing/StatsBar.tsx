const STATS = [
  { value: 'Email only', label: 'No seed phrase required' },
  { value: 'One balance', label: 'Assets across supported chains' },
  { value: 'USDC payouts', label: 'Creators receive on Arbitrum' },
  { value: 'Live alerts', label: 'OBS-ready notifications' },
]

export function StatsBar() {
  return (
    <section className="bg-s1 border-t border-b border-[var(--b)] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center animate-fade-up animate-fade-up-${i + 1} ${i < STATS.length - 1 ? 'border-r border-[var(--b)]' : ''}`}
            >
              <div className="text-[16px] font-bold text-[var(--t)]">{stat.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-[var(--ts)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
