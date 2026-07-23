'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SettingsModalProps {
  currentDisplayName: string
  username: string
  currentAlertDuration: number
  currentMinTipAmount: number
  onClose: () => void
}

const DURATIONS = [3, 5, 8]

export function SettingsModal({
  currentDisplayName,
  username,
  currentAlertDuration,
  currentMinTipAmount,
  onClose,
}: SettingsModalProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(currentDisplayName)
  const [alertDuration, setAlertDuration] = useState(currentAlertDuration)
  const [minTipAmount, setMinTipAmount] = useState(currentMinTipAmount.toString())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/streamers/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          alert_duration: alertDuration,
          min_tip_amount: parseFloat(minTipAmount) || 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save settings')
      setSaved(true)
      router.refresh()
      setTimeout(onClose, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px]"
        style={{ background: '#18181F', borderRadius: 20, padding: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t)' }}>Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ color: 'var(--ts)', fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <label className="block text-[11px] uppercase text-[var(--tm)] mb-1.5" style={{ letterSpacing: '0.06em' }}>
          Display name
        </label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mb-4" />

        <label className="block text-[11px] uppercase text-[var(--tm)] mb-1.5" style={{ letterSpacing: '0.06em' }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          readOnly
          disabled
          className="mb-1.5"
          style={{ color: 'var(--ts)', cursor: 'not-allowed' }}
        />
        <p className="mb-4 text-xs" style={{ color: 'var(--tm)' }}>
          Username cannot be changed
        </p>

        <label className="block text-[11px] uppercase text-[var(--tm)] mb-1.5" style={{ letterSpacing: '0.06em' }}>
          Alert duration
        </label>
        <div className="flex gap-2 mb-4">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setAlertDuration(d)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                background: alertDuration === d ? 'var(--or)' : '#111118',
                color: alertDuration === d ? '#fff' : 'var(--ts)',
                border: alertDuration === d ? 'none' : '1px solid var(--b)',
              }}
            >
              {d}s
            </button>
          ))}
        </div>

        <label className="block text-[11px] uppercase text-[var(--tm)] mb-1.5" style={{ letterSpacing: '0.06em' }}>
          Minimum tip amount
        </label>
        <div className="relative mb-5">
          <span
            style={{
              position: 'absolute',
              left: 15,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ts)',
              fontSize: 15,
            }}
          >
            $
          </span>
          <input
            type="number"
            min={0.5}
            step="0.5"
            value={minTipAmount}
            onChange={(e) => setMinTipAmount(e.target.value)}
            style={{ paddingLeft: 28 }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

export default SettingsModal
