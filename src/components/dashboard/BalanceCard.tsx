'use client'
import { useCallback, useEffect, useState } from 'react'
import type { IAsset } from '@particle-network/universal-account-sdk'
import { useParticleUA } from '@/hooks/useParticleUA'
import WithdrawModal from './WithdrawModal'

interface BalanceCardProps {
  ownerAddress: string
}

export function BalanceCard({ ownerAddress }: BalanceCardProps) {
  const { getBalance } = useParticleUA()
  const [balance, setBalance] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)

  // Depends on getBalance (stable — useCallback([]) inside the hook), not
  // the whole useParticleUA() return object, which is a fresh object every
  // render — depending on that would re-trigger this effect on every render.
  const loadBalance = useCallback(async () => {
    setLoadError(null)
    try {
      const assets = await getBalance(ownerAddress)
      const usdc = assets.assets.find((a: IAsset) => a.tokenType === 'usdc')
      setBalance(usdc?.amountInUSD ?? 0)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load balance')
    }
  }, [ownerAddress, getBalance])

  useEffect(() => {
    loadBalance()
  }, [loadBalance])

  return (
    <div className="relative rounded-xl p-5 mb-4" style={{ background: 'var(--ord)', border: '1px solid var(--orb)' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <div className="text-orange text-[12px] uppercase font-semibold" style={{ letterSpacing: '0.06em' }}>
            Available to withdraw
          </div>
          <div className="mt-1 text-[36px] font-black text-[var(--t)] leading-none">
            {balance === null ? (loadError ? '—' : 'Loading…') : `$${balance.toFixed(2)}`}
          </div>
          <div className="mt-1.5 text-xs text-[var(--ts)]">USDC · Arbitrum One</div>
          {loadError && <div className="mt-2 text-xs text-red-300 font-mono break-all">{loadError}</div>}
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          disabled={!balance}
          className="w-full sm:w-auto rounded-[10px] py-3 px-5 font-bold text-white bg-orange disabled:opacity-40 transition-opacity shrink-0"
        >
          Withdraw
        </button>
      </div>

      {showWithdraw && (
        <WithdrawModal
          ownerAddress={ownerAddress}
          availableUsd={balance ?? 0}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            setShowWithdraw(false)
            loadBalance()
          }}
        />
      )}
    </div>
  )
}

export default BalanceCard
