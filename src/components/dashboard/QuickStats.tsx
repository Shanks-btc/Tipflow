'use client'
import { useEffect, useState } from 'react'

interface Tip {
  fan_email: string | null
  amount_usd: number
  created_at: string
}

interface QuickStatsProps {
  streamerId: string
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function QuickStats({ streamerId }: QuickStatsProps) {
  const [tips, setTips] = useState<Tip[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/tips/${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setTips(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setTips([])
      })
    return () => {
      cancelled = true
    }
  }, [streamerId])

  const supporters = tips ? new Set(tips.map((t) => t.fan_email).filter(Boolean)).size : null
  const bestTip = tips && tips.length > 0 ? Math.max(...tips.map((t) => Number(t.amount_usd))) : tips ? 0 : null
  const thisWeek = tips
    ? tips
        .filter((t) => Date.now() - new Date(t.created_at).getTime() <= WEEK_MS)
        .reduce((sum, t) => sum + Number(t.amount_usd), 0)
    : null

  const stats = [
    { label: 'Total supporters', value: supporters === null ? '—' : supporters.toString() },
    { label: 'Best tip', value: bestTip === null ? '—' : `$${bestTip.toFixed(2)}` },
    { label: 'This week', value: thisWeek === null ? '—' : `$${thisWeek.toFixed(2)}` },
  ]

  return (
    <div
      className="grid grid-cols-3 gap-4 mb-4"
      style={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px' }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center sm:text-left">
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t)' }}>{stat.value}</div>
          <div style={{ fontSize: 12, color: 'var(--ts)' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default QuickStats
