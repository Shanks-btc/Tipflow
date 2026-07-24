'use client'
import { useState } from 'react'
import LiveDot from '@/components/shared/LiveDot'
import SettingsModal from './SettingsModal'

interface ProfileCardProps {
  displayName: string
  username: string
  alertDuration: number
  minTipAmount: number
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function ProfileCard({ displayName, username, alertDuration, minTipAmount }: ProfileCardProps) {
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const url = `tipflow.xyz/tip/${username}`
  const initial = displayName.charAt(0).toUpperCase()

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
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6"
      style={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 flex-1 min-w-0 text-center sm:text-left">
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: 64, height: 64, background: 'rgba(249,115,22,0.11)', border: '1px solid rgba(249,115,22,0.25)' }}
        >
          <span style={{ fontSize: 28, fontWeight: 900, color: '#F97316' }}>{initial}</span>
        </div>
        <div className="min-w-0">
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F0EFE8' }} className="truncate">
            {displayName}
          </div>
          <div style={{ fontSize: 14, color: '#7A7A8A' }}>@{username}</div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
            <LiveDot />
            <span style={{ fontSize: 13, color: '#34D399' }}>Your page is live</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
        <button
          onClick={handleCopy}
          style={{
            background: 'rgba(249,115,22,0.11)',
            border: '1px solid rgba(249,115,22,0.25)',
            color: '#F97316',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 10,
            padding: '9px 14px',
          }}
        >
          {copied ? 'Copied!' : 'Copy tip link'}
        </button>
        <button
          onClick={handleShareX}
          style={{
            background: 'rgba(52,211,153,0.10)',
            border: '1px solid rgba(52,211,153,0.22)',
            color: '#34D399',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 10,
            padding: '9px 14px',
          }}
        >
          Share on X
        </button>
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.13)',
            color: '#F0EFE8',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 10,
            padding: '9px 14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          My tip page
        </a>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.13)',
            color: '#7A7A8A',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 10,
            padding: '9px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <GearIcon /> Settings
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          currentDisplayName={displayName}
          username={username}
          currentAlertDuration={alertDuration}
          currentMinTipAmount={minTipAmount}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default ProfileCard
