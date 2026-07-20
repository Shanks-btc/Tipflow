'use client'
export default function WhyDifferent() {
  const cards = [
    {
      title: 'No wallet onboarding',
      text: 'Fans authenticate through email without installing MetaMask or managing recovery phrases. Magic handles everything securely.',
    },
    {
      title: 'No manual bridging',
      text: 'Tipflow uses Particle Universal Accounts to route supported balances automatically. Fans never choose a network or token.',
    },
    {
      title: 'Predictable payouts',
      text: 'Creators receive USDC on Arbitrum. Not volatile tokens, not multiple assets — just stable, withdrawable funds every time.',
    },
  ]

  return (
    <section style={{ background: 'var(--s1)', padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
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
          Your fans should not need to understand crypto to support you.
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--ts)',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '520px',
            margin: '0 auto 48px',
          }}
        >
          Tipflow handles all the complexity. Fans just use email.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: '16px',
          }}
        >
          {cards.map((c) => (
            <div
              key={c.title}
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--b)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--t)', marginBottom: '10px' }}>{c.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--ts)', lineHeight: '1.7', margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
