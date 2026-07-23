'use client'
import { Fragment } from 'react'
import Link from 'next/link'
import { useInView } from '@/hooks/useInView'

export default function GetStarted() {
  const { ref, inView } = useInView()
  const steps = [
    {
      n: '1',
      title: 'Enter your email',
      text: 'No wallet or password needed. Magic handles everything.',
    },
    {
      n: '2',
      title: 'Choose your username',
      text: 'Your personal tip link is ready instantly.',
    },
    {
      n: '3',
      title: 'Share and earn',
      text: 'Post your link anywhere your fans see you.',
    },
  ]

  return (
    <section
      ref={ref}
      className={`py-12 md:py-20 ${inView ? 'section-visible' : 'section-hidden'}`}
      style={{ background: 'var(--s1)', borderTop: '1px solid var(--b)' }}
    >
      <div className="px-5 md:px-12" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: '900',
            color: 'var(--t)',
            textAlign: 'center',
            letterSpacing: '-.02em',
            marginBottom: '12px',
          }}
        >
          Get started in 60 seconds
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--ts)',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '400px',
            margin: '0 auto 48px',
          }}
        >
          No credit card. No wallet. Just your email.
        </p>
        <div
          className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:items-center sm:justify-center"
          style={{ maxWidth: '800px', margin: '0 auto 48px' }}
        >
          {steps.map((step, i) => (
            <Fragment key={step.n}>
              <div
                className="w-full sm:flex-1 sm:min-w-[200px]"
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--b)',
                  borderRadius: '12px',
                  padding: '28px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--ord)',
                    border: '1px solid var(--orb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--or)',
                  }}
                >
                  {step.n}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t)', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--ts)', lineHeight: '1.6', margin: 0 }}>{step.text}</p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="hidden-mobile"
                  style={{ color: 'var(--or)', fontSize: '20px', padding: '0 12px', flexShrink: 0, alignItems: 'center' }}
                >
                  ·
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              display: 'inline-block',
              background: 'var(--or)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '16px',
              padding: '16px 36px',
              borderRadius: '10px',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            Create your free tip link
          </Link>
          <p style={{ fontSize: '13px', color: 'var(--ts)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--or)', textDecoration: 'none', fontWeight: '600' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
