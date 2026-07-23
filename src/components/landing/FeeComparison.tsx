'use client'
export default function FeeComparison() {
  const rows = [
    {
      platform: 'Tipflow',
      fee: '1%',
      keep: '$9.90',
      speed: '~8 seconds',
      highlight: true,
    },
    {
      platform: 'Twitch Bits',
      fee: 'Up to 50%',
      keep: '$5.00',
      speed: '45–60 days',
      highlight: false,
    },
    {
      platform: 'PayPal (blocked in 60+ countries)',
      fee: '3.5–5%',
      keep: '$9.50–$9.65',
      speed: '3–5 days',
      highlight: false,
    },
    {
      platform: 'StreamElements',
      fee: 'Variable',
      keep: 'Variable',
      speed: 'Variable',
      highlight: false,
    },
  ]

  return (
    <section id="fee-comparison" className="py-12 md:py-20" style={{ background: 'var(--s1)' }}>
      <div className="px-5 md:px-12" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'var(--t)',
            textAlign: 'center',
            letterSpacing: '-.02em',
            marginBottom: '12px',
          }}
        >
          Simple, honest pricing
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--ts)',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '480px',
            margin: '0 auto 48px',
          }}
        >
          Compare what you actually keep per $10 tip
        </p>
        <div style={{ maxWidth: '700px', margin: '0 auto', overflowX: 'auto' }}>
          <div
            style={{
              minWidth: '520px',
              background: 'var(--s2)',
              border: '1px solid var(--b)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '12px 24px',
                background: '#0D0D14',
                borderBottom: '1px solid var(--b)',
              }}
            >
              {['Platform', 'Fee', 'You keep', 'Speed'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--ts)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {rows.map((row, i) => (
              <div
                key={row.platform}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '16px 24px',
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: row.highlight ? 'rgba(249,115,22,0.06)' : 'transparent',
                  borderLeft: row.highlight ? '3px solid var(--or)' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '600', color: row.highlight ? 'var(--or)' : 'var(--t)' }}>
                  {row.platform}
                </span>
                <span style={{ fontSize: '14px', color: row.highlight ? 'var(--tl)' : 'var(--ts)' }}>{row.fee}</span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: row.highlight ? '700' : '400',
                    color: row.highlight ? 'var(--tl)' : 'var(--ts)',
                  }}
                >
                  {row.keep}
                </span>
                <span style={{ fontSize: '14px', color: row.highlight ? 'var(--tl)' : 'var(--ts)' }}>{row.speed}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--tm)', textAlign: 'center', marginTop: '16px' }}>
          * Tipflow charges 1% per successful tip. No monthly fee. No setup cost. Withdraw any time.
        </p>
      </div>
    </section>
  )
}
