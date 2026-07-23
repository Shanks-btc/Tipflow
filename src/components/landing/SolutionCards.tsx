'use client'
import { useInView } from '@/hooks/useInView'

export default function SolutionCards() {
  const { ref, inView } = useInView()
  const solutions = [
    {
      title: 'Email-only onboarding',
      text: 'Magic creates an embedded wallet from just an email address. No MetaMask. No seed phrase. Works on any device, any browser, anywhere in the world.',
      tag: 'Powered by Magic',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" width="24" height="24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      title: 'Cross-chain routing',
      text: "Particle Universal Accounts pool a fan's assets across supported chains. They pay from wherever their funds are. The creator always receives USDC on Arbitrum.",
      tag: 'Powered by Particle Network',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" width="24" height="24">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
    {
      title: '8-second settlement',
      text: "Arbitrum's 2-second finality means the tip confirms, the creator's dashboard updates, and the OBS alert fires — all before the stream chat moves on.",
      tag: 'Powered by Arbitrum',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" width="24" height="24">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ]

  return (
    <section ref={ref} className="py-12 md:py-20" style={{ background: 'var(--bg)' }}>
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
          The Tipflow solution
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--ts)',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '560px',
            margin: '0 auto 48px',
          }}
        >
          We rebuilt tipping from scratch using Magic, Particle Universal Accounts and Arbitrum.
        </p>
        <div className="grid grid-cols-1 min-[640px]:grid-cols-3" style={{ gap: '16px' }}>
          {solutions.map((s, index) => (
            <div
              key={s.title}
              style={{
                background: 'var(--s2)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #F97316, #FBBF24)',
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'var(--ord)',
                  border: '1px solid var(--orb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {s.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--t)', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--ts)', lineHeight: '1.7', flexGrow: 1, margin: 0 }}>{s.text}</p>
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--b)',
                  fontSize: '11px',
                  color: 'var(--tm)',
                  fontWeight: '600',
                }}
              >
                {s.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
