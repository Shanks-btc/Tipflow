interface AlertCardProps {
  fanName: string
  amount: number
  message: string
}

// Uses inline styles (not Tailwind) for pixel-exact values against the
// Phase 4 spec, and references the alertIn / shrink @keyframes already
// defined in globals.css.
export function AlertCard({ fanName, amount, message }: AlertCardProps) {
  const initial = fanName.charAt(0).toUpperCase()

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(10,8,5,0.93)',
        border: '1px solid rgba(249,115,22,0.45)',
        borderRadius: 14,
        minWidth: 300,
        maxWidth: 420,
        padding: '14px 18px',
        overflow: 'hidden',
        animation: 'alertIn 0.45s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: '#F97316' }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 2,
          width: '100%',
          background: '#F97316',
          animation: 'shrink 5s linear forwards',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(249,115,22,0.11)',
            border: '1px solid rgba(249,115,22,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F97316',
            fontWeight: 800,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
            {fanName} tipped ${amount}
          </div>
          {message && (
            <div
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 12,
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlertCard
