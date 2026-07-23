'use client'
import { useState, useEffect } from 'react'

export default function TypewriterText({
  text,
  delay = 80,
  style
}: {
  text: string
  delay?: number
  style?: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, delay)
    return () => clearInterval(timer)
  }, [text, delay])

  useEffect(() => {
    const cursor = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(cursor)
  }, [])

  return (
    <span style={style}>
      {displayed}
      <span style={{
        opacity: showCursor ? 1 : 0,
        transition: 'opacity 0.1s',
        color: 'var(--or)',
        fontWeight: 900
      }}>|</span>
    </span>
  )
}
