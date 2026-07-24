interface EmailModalProps {
  amount: number
  streamerName: string
  email: string
  onEmailChange: (email: string) => void
  onContinue: () => void
  onBack: () => void
  loading?: boolean
}

// Resend-based email OTP (see useMagicAuth.ts). onContinue (implemented in
// TipCard) calls useMagicAuth().sendOTP(email) — this component just owns
// the input UI and shows a loading state while that request is in flight.
export function EmailModal({ amount, streamerName, email, onEmailChange, onContinue, onBack, loading }: EmailModalProps) {
  const handleContinue = () => {
    if (!email || loading) return
    onContinue()
  }

  return (
    <div>
      <div className="w-12 h-12 rounded-full bg-orange-dim flex items-center justify-center mb-4">
        <span className="text-orange text-xl">✉</span>
      </div>
      <h2 className="text-xl font-extrabold text-[var(--t)]">Where do we send your receipt?</h2>
      <p className="mt-1 mb-4 text-sm text-[var(--ts)]">One more step before it&apos;s on its way</p>

      <div className="bg-s1 border border-[var(--b)] rounded-lg p-3 mb-5 text-left">
        <div className="flex justify-between text-sm py-1">
          <span className="text-[var(--ts)]">You send</span>
          <span className="text-[var(--t)] font-semibold">${amount}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-[var(--ts)]">To</span>
          <span className="text-[var(--t)] font-semibold">{streamerName}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-[var(--ts)]">Network</span>
          <span className="text-orange font-semibold">Arbitrum</span>
        </div>
      </div>

      <input
        type="email"
        inputMode="email"
        autoFocus
        placeholder="you@example.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        disabled={loading}
        className="mb-4"
      />
      <button
        onClick={handleContinue}
        disabled={!email || loading}
        className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
      >
        {loading ? 'Sending code…' : 'Continue'}
      </button>
      <button onClick={onBack} disabled={loading} className="mt-3 text-xs text-[var(--ts)] hover:text-[var(--t)] disabled:opacity-40">
        Back
      </button>
    </div>
  )
}

export default EmailModal
