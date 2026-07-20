import ChainRoute from '@/components/shared/ChainRoute'

interface SendingStateProps {
  amount: number
  streamerName: string
}

// No wallet addresses, tx hashes, or other technical detail here by design
// — the fan should never see crypto plumbing mid-flow.
export function SendingState({ amount, streamerName }: SendingStateProps) {
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
      <p className="mt-1 mb-5 text-sm text-[var(--ts)]">Reaching {streamerName}</p>
      <ChainRoute />
    </div>
  )
}

export default SendingState
