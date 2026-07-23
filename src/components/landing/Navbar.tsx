'use client'
import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'For streamers', href: '/#for-streamers' },
  { label: 'Pricing', href: '/#fee-comparison' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      style={{
        background: 'var(--s1)',
        borderBottom: '1px solid var(--b)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--t)', textDecoration: 'none' }}>
          Tipflow
        </Link>

        {/* Desktop nav links - hidden on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: '14px', color: 'var(--ts)', textDecoration: 'none', transition: 'color .15s' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA buttons - hidden on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
          <Link href="/login" style={{ fontSize: '14px', color: 'var(--ts)', textDecoration: 'none', padding: '8px 16px' }}>
            Log in
          </Link>
          <Link
            href="/login"
            style={{
              background: 'var(--or)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '700',
              padding: '10px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            Get tip link
          </Link>
        </div>

        {/* Mobile right side - CTA + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="show-mobile">
          <Link
            href="/login"
            style={{
              background: 'var(--or)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              padding: '9px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            Get tip link
          </Link>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            style={{
              background: 'none',
              border: '1px solid var(--b)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minHeight: '44px',
              minWidth: '44px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '18px',
                height: '2px',
                background: 'var(--t)',
                transition: 'all .2s',
                transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '18px',
                height: '2px',
                background: 'var(--t)',
                transition: 'all .2s',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: 'block',
                width: '18px',
                height: '2px',
                background: 'var(--t)',
                transition: 'all .2s',
                transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          style={{ background: 'var(--s1)', borderTop: '1px solid var(--b)', padding: '16px 20px 24px', flexDirection: 'column' }}
          className="show-mobile"
        >
          {[...NAV_LINKS, { label: 'Log in', href: '/login' }].map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '14px 0',
                fontSize: '16px',
                color: 'var(--t)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--b)',
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              marginTop: '16px',
              background: 'var(--or)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '15px',
              padding: '14px',
              borderRadius: '10px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Create your free tip link →
          </Link>
        </div>
      )}
    </nav>
  )
}
