'use client'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

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

interface TipTableProps {
  streamerId: string
  username: string
}

function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

function truncateMessage(message: string, max = 40): string {
  return message.length <= max ? message : `${message.slice(0, max)}…`
}

const thStyle: CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  color: 'var(--ts)',
  letterSpacing: '0.08em',
  padding: '12px 16px',
  fontWeight: 700,
}

const tdStyle: CSSProperties = {
  padding: 16,
}

export function TipTable({ streamerId, username }: TipTableProps) {
  const [tips, setTips] = useState<Tip[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const url = `tipflow.xyz/tip/${username}`

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareX = () => {
    const text = `Support me on Tipflow! 🎮 Tip me with just your email — no wallet needed.\n${url}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>Recent tips</h2>
        {tips && tips.length > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[11px]"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--ts)' }}
          >
            {tips.length} tip{tips.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div style={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loadError && <p className="p-4 text-xs text-red-300 font-mono break-all">{loadError}</p>}

        {!loadError && tips === null && <p className="p-4 text-sm text-[var(--ts)]">Loading…</p>}

        {tips && tips.length === 0 && (
          <div className="text-center py-12 px-4">
            <div
              className="rounded-full mx-auto flex items-center justify-center mb-3"
              style={{ width: 48, height: 48, background: 'var(--tld)', border: '1px solid var(--tlb)' }}
            >
              <span className="text-teal text-xl">⚡</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>No tips yet</p>
            <p className="mt-1 mb-5 text-sm" style={{ color: 'var(--ts)' }}>
              Share your tip link to receive your first tip
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button onClick={handleCopy} className="rounded-[10px] py-2.5 px-4 font-bold text-white bg-orange transition-opacity">
                {copied ? 'Copied!' : 'Copy tip link'}
              </button>
              <button
                onClick={handleShareX}
                className="rounded-[10px] py-2.5 px-4 font-semibold text-[var(--t)] bg-transparent border border-[var(--b)]"
              >
                Share on X
              </button>
            </div>
          </div>
        )}

        {tips && tips.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full border-collapse" style={{ minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#111118' }}>
                  <th className="text-left" style={thStyle}>Fan</th>
                  <th className="text-left" style={thStyle}>Amount</th>
                  <th className="text-left hidden md:table-cell" style={thStyle}>Message</th>
                  <th className="text-left" style={thStyle}>Time</th>
                  <th className="text-left hidden md:table-cell" style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tips.map((tip) => {
                  const fanName = tip.fan_email?.split('@')[0] || 'Anonymous'
                  const initial = fanName.charAt(0).toUpperCase()
                  const isConfirmed = tip.status === 'confirmed'
                  return (
                    <tr key={tip.id} className="hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={tdStyle}>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="rounded-full flex items-center justify-center shrink-0"
                            style={{ width: 32, height: 32, background: 'var(--ord)', border: '1px solid var(--orb)' }}
                          >
                            <span className="text-orange font-bold text-xs">{initial}</span>
                          </div>
                          <span className="text-sm font-semibold text-[var(--t)] truncate">{fanName}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span className="text-teal font-bold text-sm">+${Number(tip.amount_usd).toFixed(2)}</span>
                      </td>
                      <td className="hidden md:table-cell" style={tdStyle}>
                        {tip.message ? (
                          <span className="italic text-sm" style={{ color: 'var(--ts)' }}>
                            {truncateMessage(tip.message)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--tm)' }}>—</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 13, color: 'var(--ts)' }}>{formatRelativeTime(tip.created_at)}</span>
                      </td>
                      <td className="hidden md:table-cell" style={tdStyle}>
                        <span
                          className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={
                            isConfirmed
                              ? { background: 'var(--tld)', color: 'var(--tl)' }
                              : { background: 'var(--ord)', color: 'var(--or)' }
                          }
                        >
                          {isConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TipTable
