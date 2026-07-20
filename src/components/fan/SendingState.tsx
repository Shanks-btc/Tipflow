import ChainRoute from '@/components/shared/ChainRoute'

export type SendPhase = 'preparing' | 'confirming' | 'sending'

const PHASES: { key: SendPhase; label: string }[] = [
  { key: 'preparing', label: 'Preparing' },
  { key: 'confirming', label: 'Confirming' },
  { key: 'sending', label: 'Sending' },
]

interface SendingStateProps {
  amount: number
  streamerName: string
  phase?: SendPhase
}

// No wallet addresses, tx hashes, EIP-7702/Universal-Account terminology, or
// other technical detail here by design — the fan should never see crypto
// plumbing mid-flow. `phase` is a fan-friendly summary derived from
// useParticleUA's raw onProgress messages (see TipCard's mapSendPhase), not
// those messages themselves.
export function SendingState({ amount, streamerName, phase = 'preparing' }: SendingStateProps) {
  const activeIndex = PHASES.findIndex((p) => p.key === phase)

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div
        className="rounded-full mb-5"
        style={{
          width: 56,
          height: 56,
          border: '2.5px solid var(--b)',
          borderTopColor: '#F97316',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <h2 className="text-xl font-extrabold text-[var(--t)]">Routing your ${amount} tip</h2>
      <p className="mt-1 mb-4 text-sm text-[var(--ts)]">Reaching {streamerName}</p>

      <div className="flex items-center gap-2 mb-5">
        {PHASES.map((p, i) => (
          <div key={p.key} className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: i <= activeIndex ? '#F97316' : 'var(--tm)' }}>
              {p.label}
            </span>
            {i < PHASES.length - 1 && (
              <span className="w-4 h-px" style={{ background: i < activeIndex ? '#F97316' : 'var(--b)' }} />
            )}
          </div>
        ))}
      </div>

      <ChainRoute />
    </div>
  )
}

export default SendingState
