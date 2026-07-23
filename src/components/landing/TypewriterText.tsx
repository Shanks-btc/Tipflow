'use client'
import { useState, useEffect } from 'react'

type Phase = 'waiting' | 'typing' | 'pausing' | 'deleting' | 'resting'

export default function TypewriterText({
  text,
  style
}: {
  text: string
  style?: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<Phase>('waiting')

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (phase === 'waiting') {
      timeout = setTimeout(() => setPhase('typing'), 1500)
    }

    else if (phase === 'typing') {
      if (displayed.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length + 1))
        }, 80)
      } else {
        timeout = setTimeout(() => setPhase('pausing'), 2000)
      }
    }

    else if (phase === 'pausing') {
      setPhase('deleting')
    }

    else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(prev => prev.slice(0, -1))
        }, 40)
      } else {
        timeout = setTimeout(() => setPhase('typing'), 1000)
      }
    }

    return () => clearTimeout(timeout)
  }, [phase, displayed, text])

  const showCursor = phase === 'typing' || phase === 'deleting'

  return (
    <span style={style}>
      {displayed}
      <span style={{
        opacity: showCursor ? 1 : 0,
        color: 'var(--or)',
        fontWeight: 900,
        transition: 'opacity 0.15s'
      }}>|</span>
    </span>
  )
}
