'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SettingsModal from './SettingsModal'

interface DashboardNavProps {
  username: string
  displayName: string
  alertDuration: number
  minTipAmount: number
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function DashboardNav({ username, displayName, alertDuration, minTipAmount }: DashboardNavProps) {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/')
    }
  }

  return (
    <nav
      style={{
        background: '#111118',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link href="/" style={{ fontSize: 18, fontWeight: 900, color: 'var(--t)', textDecoration: 'none' }}>
        Tipflow
      </Link>

      <div className="flex items-center gap-3">
        <a
          href={`https://tipflow.xyz/tip/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden-mobile"
          style={{ fontSize: 13, color: 'var(--ts)', textDecoration: 'none' }}
        >
          View my page →
        </a>

        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ts)',
            flexShrink: 0,
          }}
        >
          <GearIcon />
        </button>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--ts)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          className="disabled:opacity-40 transition-opacity"
        >
          {loggingOut ? '…' : 'Log out'}
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
    </nav>
  )
}

export default DashboardNav
