interface StatCardProps {
  label: string
  value: string
  sub?: string
  stripeGradient: string
}

export function StatCard({ label, value, sub, stripeGradient }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-s2 border border-[var(--b)] p-4">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: stripeGradient }} />
      <div className="text-[11px] uppercase text-[var(--tm)]" style={{ letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-black text-[var(--t)]">{value}</div>
      {sub && <div className="mt-1 text-xs text-[var(--ts)]">{sub}</div>}
    </div>
  )
}

export default StatCard
