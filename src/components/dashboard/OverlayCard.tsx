'use client'
import { useState } from 'react'
import { WS_URL } from '@/lib/constants'

interface OverlayCardProps {
  username: string
}

export function OverlayCard({ username }: OverlayCardProps) {
  const [copied, setCopied] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const url = `tipflow.xyz/overlay/${username}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTestAlert = async () => {
    setTestStatus('sending')
    try {
      const res = await fetch(`${WS_URL}/test-alert/${username}`, { method: 'POST' })
      if (!res.ok) throw new Error(`WebSocket server returned ${res.status}`)
      setTestStatus('sent')
      setTimeout(() => setTestStatus('idle'), 3000)
    } catch {
      setTestStatus('error')
      setTimeout(() => setTestStatus('idle'), 3000)
    }
  }

  return (
    <div className="rounded-xl bg-s2 border border-[var(--b)] p-4">
      <div className="text-[11px] uppercase text-[var(--tm)] mb-2" style={{ letterSpacing: '0.06em' }}>
        OBS overlay URL
      </div>
      <div className="font-mono text-sm text-[var(--t)] overflow-hidden text-ellipsis whitespace-nowrap block max-w-full mb-3">
        {url}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 rounded-[10px] py-2.5 font-semibold text-orange bg-orange-dim border border-[var(--orb)]"
        >
          {copied ? 'Copied ✓' : 'Copy URL'}
        </button>
        <button
          onClick={handleTestAlert}
          disabled={testStatus === 'sending'}
          className="flex-1 rounded-[10px] py-2.5 font-semibold text-[var(--t)] bg-transparent border border-[var(--b)] disabled:opacity-40"
        >
          {testStatus === 'sending' ? 'Sending…' : testStatus === 'sent' ? 'Sent ✓' : testStatus === 'error' ? 'Failed' : 'Test alert'}
        </button>
      </div>
    </div>
  )
}

export default OverlayCard
