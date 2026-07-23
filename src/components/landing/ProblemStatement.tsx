'use client'
import { useInView } from '@/hooks/useInView'

export default function ProblemStatement() {
  const { ref, inView } = useInView()
  const problems = [
    {
      title: 'Geo-blocked payments',
      text: 'PayPal is blocked in 60+ countries. Twitch Bits are unavailable in most of the world. Fans who want to support simply cannot.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" width="24" height="24">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    {
      title: 'Platforms take 30-50%',
      text: 'Twitch keeps up to 50% of subscriptions. StreamElements charges fees on donations. Creators lose a significant cut of every tip.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" width="24" height="24">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      ),
    },
    {
      title: 'Crypto is too complex',
      text: 'Existing Web3 tipping tools require MetaMask, seed phrases and manual network switching. Most fans give up before sending anything.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" width="24" height="24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ]

  return (
    <section ref={ref} className="py-12 md:py-20" style={{ background: '#0D0D14' }}>
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
          The problem with tipping streamers today
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
          Fans want to support their favourite creators. The platforms make it nearly impossible.
        </p>
        <div className="grid grid-cols-1 min-[640px]:grid-cols-3" style={{ gap: '16px', marginBottom: '48px' }}>
          {problems.map((p, index) => (
            <div
              key={p.title}
              style={{
                background: 'var(--s2)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '12px',
                padding: '24px',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {p.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t)', marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--ts)', lineHeight: '1.7', margin: 0 }}>{p.text}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--or)',
            }}
          >
            <span>Tipflow solves all three</span>
            <span style={{ fontSize: '20px' }}>↓</span>
          </div>
        </div>
      </div>
    </section>
  )
}
