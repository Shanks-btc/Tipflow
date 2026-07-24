'use client'
import { useState, useEffect, useRef } from 'react'

export default function TypewriterText({
  text,
  style
}: {
  text: string
  style?: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const startAnimation = () => {
      let i = 0
      let phase = 'type1'

      const tick = () => {
        if (phase === 'type1') {
          i++
          setDisplayed(text.slice(0, i))
          if (i >= text.length) {
            phase = 'delete1'
            setTimeout(tick, 700)
          } else {
            setTimeout(tick, 80)
          }
        } else if (phase === 'delete1') {
          i--
          setDisplayed(text.slice(0, i))
          if (i <= 0) {
            phase = 'type2'
            setTimeout(tick, 400)
          } else {
            setTimeout(tick, 40)
          }
        } else if (phase === 'type2') {
          i++
          setDisplayed(text.slice(0, i))
          if (i >= text.length) {
            phase = 'done'
            setCursorVisible(false)
          } else {
            setTimeout(tick, 80)
          }
        }
      }

      // Wait 500ms after page load fires then start
      setTimeout(tick, 500)
    }

    // Use window.onload to guarantee page is fully loaded
    if (document.readyState === 'complete') {
      // Page already loaded — wait 500ms then start
      setTimeout(startAnimation, 500)
    } else {
      // Page not loaded yet — wait for load event
      window.addEventListener('load', startAnimation, { once: true })
    }

    return () => {
      window.removeEventListener('load', startAnimation)
    }
  }, [text])

  // Cursor blink — stops when cursorVisible set to false
  useEffect(() => {
    if (!cursorVisible) return
    const t = setInterval(() => {
      setCursorVisible(p => !p)
    }, 530)
    return () => clearInterval(t)
  }, [cursorVisible])

  return (
    <span style={style}>
      {displayed}
      {cursorVisible && (
        <span style={{
          opacity: 1,
          transition: 'opacity 0.1s',
          marginLeft: '1px',
          color: 'var(--or)'
        }}>|</span>
      )}
    </span>
  )
}
