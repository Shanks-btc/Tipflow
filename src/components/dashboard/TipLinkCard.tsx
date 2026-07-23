'use client'
import { useState } from 'react'

interface TipLinkCardProps {
  username: string
}

export function TipLinkCard({ username }: TipLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const url = `tipflow.xyz/tip/${username}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Tip me on Tipflow', url })
      } catch {
        // user cancelled — no-op
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="rounded-xl bg-s2 border border-[var(--b)] p-4">
      <div className="text-[11px] uppercase text-[var(--tm)] mb-2" style={{ letterSpacing: '0.06em' }}>
        Your tip link
      </div>
      <div className="font-mono text-sm text-[var(--t)] overflow-hidden text-ellipsis whitespace-nowrap block max-w-full mb-3">
        {url}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 rounded-[10px] py-2.5 font-semibold text-orange bg-orange-dim border border-[var(--orb)] transition-opacity"
        >
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 rounded-[10px] py-2.5 font-semibold text-[var(--t)] bg-transparent border border-[var(--b)]"
        >
          Share
        </button>
      </div>
    </div>
  )
}

export default TipLinkCard
