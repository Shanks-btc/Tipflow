'use client'
import { useState } from 'react'
import { useMagicAuth } from '@/hooks/useMagicAuth'
import { useParticleUA } from '@/hooks/useParticleUA'

interface WithdrawModalProps {
  ownerAddress: string
  availableUsd: number
  onClose: () => void
  onSuccess: () => void
}

type Step = 'form' | 'sending' | 'success' | 'error'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WithdrawModal({ ownerAddress, availableUsd, onClose, onSuccess }: WithdrawModalProps) {
  const magicAuth = useMagicAuth()
  const particleUA = useParticleUA()

  const [step, setStep] = useState<Step>('form')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState(availableUsd > 0 ? availableUsd.toFixed(2) : '')
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  const amountNum = parseFloat(amount)
  const isValidDestination = /^0x[a-fA-F0-9]{40}$/.test(destination)
  const isValidAmount = !isNaN(amountNum) && amountNum > 0 && amountNum <= availableUsd
  const canSubmit = isValidDestination && isValidAmount

  const handleSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setStep('sending')
    try {
      const signerAddress = await magicAuth.getAddress()
      if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error("Signed-in wallet does not match this account's payout address — log in again.")
      }
      const signer = magicAuth.getSigner()
      const id = await particleUA.withdraw({
        signer,
        toAddress: destination,
        amountUsd: amountNum,
        onProgress: setProgress,
      })
      setTxId(id)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
      setStep('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-s2 border border-[var(--b)] rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-[var(--t)]">Withdraw USDC</h2>
              <button onClick={onClose} className="text-[var(--ts)] hover:text-[var(--t)] text-xl leading-none">
                ×
              </button>
            </div>

            <label className="block text-[11px] uppercase text-[var(--tm)] mb-1.5" style={{ letterSpacing: '0.06em' }}>
              Destination address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={destination}
              onChange={(e) => setDestination(e.target.value.trim())}
              className="mb-4 font-mono text-sm"
            />

            <label className="block text-[11px] uppercase text-[var(--tm)] mb-1.5" style={{ letterSpacing: '0.06em' }}>
              Amount (USDC) — ${availableUsd.toFixed(2)} available
            </label>
            <input
              type="number"
              min={0}
              max={availableUsd}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mb-5"
            />

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
            >
              Withdraw ${!isNaN(amountNum) ? amountNum.toFixed(2) : '0.00'}
            </button>
          </>
        )}

        {step === 'sending' && (
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-orange border-t-transparent mx-auto mb-4"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <h2 className="text-lg font-extrabold text-[var(--t)] mb-1">Sending withdrawal…</h2>
            <p className="text-xs text-[var(--ts)] font-mono break-all">{progress}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-teal-dim border border-[var(--tlb)] mx-auto flex items-center justify-center mb-4">
              <span className="text-teal text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-black text-[var(--t)] mb-1">${amountNum.toFixed(2)} sent</h2>
            <p className="text-sm text-[var(--ts)] mb-1">to {truncateAddress(destination)}</p>
            {txId && <p className="text-xs text-[var(--tm)] font-mono break-all mb-5">{txId}</p>}
            <button
              onClick={onSuccess}
              className="w-full rounded-[10px] py-[14px] font-bold bg-orange-dim border border-[var(--orb)] text-orange"
            >
              Done
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-4">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h2 className="text-lg font-black text-red-400 mb-3">Withdrawal failed</h2>
            <pre className="bg-s1 rounded-lg p-3 mb-4 text-left text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
              {error}
            </pre>
            <button onClick={() => setStep('form')} className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WithdrawModal
