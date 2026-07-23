'use client'
export default function Footer() {
  const cols = [
    {
      heading: 'Product',
      links: [
        { label: 'For Creators', href: '/login' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Pricing', href: '/#fee-comparison' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Fee Disclosure', href: '#' },
      ],
    },
    {
      heading: 'Links',
      links: [
        { label: 'GitHub', href: 'https://github.com/Shanks-btc/Tipflow' },
        { label: 'X / Twitter', href: 'https://x.com/Shank_btc' },
        { label: 'Help', href: '#' },
      ],
    },
  ]

  return (
    <footer className="pt-8 pb-6 md:pt-12" style={{ background: '#060609', borderTop: '1px solid var(--b)' }}>
      <div className="px-5 md:px-12" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr]"
          style={{
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--t)', marginBottom: '12px' }}>Tipflow</div>
            <p style={{ fontSize: '13px', color: 'var(--ts)', lineHeight: '1.7', marginBottom: '12px' }}>
              Tip any streamer. Instantly.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--tm)' }}>
              Built on Particle Universal Accounts, Magic and Arbitrum.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--ts)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  marginBottom: '16px',
                }}
              >
                {col.heading}
              </div>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: 'var(--ts)',
                    textDecoration: 'none',
                    marginBottom: '10px',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: '1px solid var(--b)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--tm)' }}>© 2026 Tipflow. Built for UXmaxx by Encode Club.</span>
          <span style={{ fontSize: '12px', color: 'var(--tm)' }}>Powered by Particle Network · Magic · Arbitrum</span>
        </div>
      </div>
    </footer>
  )
}
