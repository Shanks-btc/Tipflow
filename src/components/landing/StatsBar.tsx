const STATS = [
  { value: '$3.1M+', label: 'Paid to creators' },
  { value: '8s', label: 'Avg tip speed' },
  { value: '195', label: 'Countries' },
  { value: '0%', label: 'Platform cut' },
]

export function StatsBar() {
  return (
    <section className="bg-s1 border-t border-b border-[var(--b)] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i < STATS.length - 1 ? 'border-r border-[var(--b)]' : ''}`}
            >
              <div className="text-[36px] font-black text-orange">{stat.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-[var(--ts)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
