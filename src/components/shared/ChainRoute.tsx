export function ChainRoute() {
  return (
    <div className="bg-s1 border border-[var(--b)] rounded-full px-4 py-2 text-xs font-mono flex items-center gap-2">
      <span className="text-[var(--ts)]">BSC</span>
      <span className="text-[var(--tm)]">·</span>
      <span className="text-orange">Particle UA</span>
      <span className="text-[var(--tm)]">·</span>
      <span className="text-teal">Arbitrum</span>
    </div>
  )
}

export default ChainRoute
