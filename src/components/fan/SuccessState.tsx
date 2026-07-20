interface SuccessStateProps {
  amount: number
  streamerName: string
  message?: string
  elapsedSeconds: number
  onTipAgain: () => void
}

// Per Phase 3 spec, "Arbitrum" is the one allowed exception to the
// zero-crypto-language rule — it only appears here, in the post-tip
// receipt, never earlier in the flow. No raw tx hash is shown to the fan.
export function SuccessState({ amount, streamerName, message, elapsedSeconds, onTipAgain }: SuccessStateProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-teal-dim border border-[var(--tlb)] mx-auto flex items-center justify-center mb-4">
        <span className="text-teal text-2xl">✓</span>
      </div>
      <h2 className="text-[24px] font-black text-[var(--t)]">
        ${amount} sent to {streamerName}!
      </h2>
      <p className="mt-1 mb-4 text-sm text-[var(--ts)]">Watch for your name to appear on stream</p>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-s1 border border-[var(--b)] text-left">
          <p className="text-sm text-[var(--ts)] italic">&ldquo;{message}&rdquo;</p>
        </div>
      )}

      <div className="bg-s1 border border-[var(--b)] rounded-lg p-3 mb-5 text-left">
        <div className="flex justify-between text-sm py-1">
          <span className="text-[var(--ts)]">Amount</span>
          <span className="text-[var(--t)] font-semibold">${amount}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-[var(--ts)]">Platform fee</span>
          <span className="text-teal font-semibold">$0.00</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-[var(--ts)]">Settled on</span>
          <span className="text-orange font-semibold">
            Arbitrum · {elapsedSeconds}s
          </span>
        </div>
      </div>

      <button
        onClick={onTipAgain}
        className="w-full rounded-[10px] py-[14px] font-bold bg-orange-dim border border-[var(--orb)] text-orange"
      >
        Tip again
      </button>
    </div>
  )
}

export default SuccessState
