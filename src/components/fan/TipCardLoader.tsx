'use client'
import dynamic from 'next/dynamic'
import type { Streamer } from '@/lib/streamers'

// next/dynamic with ssr:false is only allowed in Client Components — the
// page itself stays a Server Component (it fetches streamer data server-
// side), so this thin wrapper is what actually performs the dynamic import.
const TipCard = dynamic(() => import('./TipCard'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        maxWidth: '390px',
        margin: '0 auto',
        background: '#18181F',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2.5px solid rgba(249,115,22,0.2)',
          borderTopColor: '#F97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  ),
})

interface TipCardLoaderProps {
  username: string
  initialStreamer: Streamer | null
}

export function TipCardLoader({ username, initialStreamer }: TipCardLoaderProps) {
  return <TipCard username={username} initialStreamer={initialStreamer} />
}

export default TipCardLoader
