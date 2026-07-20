'use client'
import { useEffect, useState } from 'react'

interface Tip {
  id: string
  fan_email: string | null
  amount_usd: number
  message: string | null
  tx_hash: string
  source_chain: string | null
  status: string
  created_at: string
}

interface TipFeedProps {
  streamerId: string
}

function formatTimeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function TipFeed({ streamerId }: TipFeedProps) {
  const [tips, setTips] = useState<Tip[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // Supabase's server client does a fresh connection/auth handshake per
    // request (no pooling) — 5-8s responses are routine, not a hang, but
    // a genuinely stuck request (dev server hiccup, network drop) still
    // needs a hard ceiling so this can never sit on "Loading…" forever.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    fetch(`/api/tips/${streamerId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setTips(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (cancelled) return
        const message =
          err instanceof Error && err.name === 'AbortError'
            ? 'Timed out loading tips — refresh to try again'
            : err instanceof Error
              ? err.message
              : 'Failed to load tips'
        setLoadError(message)
      })
      .finally(() => clearTimeout(timeout))

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeout)
    }
  }, [streamerId])

  return (
    <div className="rounded-xl bg-s2 border border-[var(--b)] p-4">
      <div className="text-[11px] uppercase text-[var(--tm)] mb-3" style={{ letterSpacing: '0.06em' }}>
        Recent tips
      </div>

      {loadError && <p className="text-xs text-red-300 font-mono break-all">{loadError}</p>}

      {!loadError && tips === null && <p className="text-sm text-[var(--ts)]">Loading…</p>}

      {tips && tips.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-teal-dim border border-[var(--tlb)] mx-auto flex items-center justify-center mb-3">
            <span className="text-teal text-xl">⚡</span>
          </div>
          <p className="text-sm text-[var(--t)] font-semibold">No tips yet</p>
          <p className="mt-1 text-xs text-[var(--ts)]">Your tips will appear here when fans send them</p>
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="flex flex-col gap-3">
          {tips.map((tip) => {
            const fanName = tip.fan_email?.split('@')[0] || 'Anonymous'
            const initial = fanName.charAt(0).toUpperCase()
            return (
              <div key={tip.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-dim border border-[var(--orb)] flex items-center justify-center text-orange font-bold text-sm shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--t)] truncate">{fanName}</div>
                  {tip.message && <div className="text-xs text-[var(--ts)] truncate">{tip.message}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-teal font-bold text-sm">+${Number(tip.amount_usd).toFixed(2)}</div>
                  <div className="text-[11px] text-[var(--tm)]">
                    {formatTimeAgo(tip.created_at)} · {tip.source_chain ?? 'arbitrum'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TipFeed
