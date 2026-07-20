'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { AlertCard } from '@/components/overlay/AlertCard'
import { WS_URL } from '@/lib/constants'

interface TipAlert {
  fanName: string
  amount: number
  message: string
  txHash: string
}

export default function OverlayPage({ params }: { params: { username: string } }) {
  const [alert, setAlert] = useState<TipAlert | null>(null)

  // Root layout.tsx owns <html>/<body> and applies the app's dark
  // background globally — only the root layout is allowed to render
  // <html>/<body> in Next.js, so a nested layout here can't override it.
  // Setting it directly is the standard workaround, and it's what actually
  // matters: OBS's Browser Source captures the real DOM background, not
  // any CSS class name.
  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
    document.body.style.background = 'transparent'
    document.body.style.backgroundColor = 'transparent'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
  }, [])

  useEffect(() => {
    const socket: Socket = io(WS_URL)
    socket.emit('join_overlay', params.username)
    socket.on('tip_received', (data: TipAlert) => {
      setAlert(data)
      setTimeout(() => setAlert(null), 5000)
    })
    return () => {
      socket.disconnect()
    }
  }, [params.username])

  if (!alert) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24 }}>
      <AlertCard fanName={alert.fanName} amount={alert.amount} message={alert.message} />
    </div>
  )
}
