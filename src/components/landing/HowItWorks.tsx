'use client'
import { useState } from 'react'

const CREATOR_STEPS = [
  {
    number: '01',
    title: 'Create your page',
    description: 'Login with email. Choose your username. Ready in 30 seconds.',
  },
  {
    number: '02',
    title: 'Share your link',
    description: 'Post tipflow.xyz/tip/you on Twitch, YouTube, X or Discord.',
  },
  {
    number: '03',
    title: 'Receive live',
    description: 'Get USDC on Arbitrum with real-time OBS stream alerts.',
  },
]

const FAN_STEPS = [
  {
    number: '01',
    title: "Open a creator's link",
    description: 'Visit their personal Tipflow page. No account needed to browse.',
  },
  {
    number: '02',
    title: 'Sign in with email',
    description: 'Magic securely creates your account. No wallet extension required.',
  },
  {
    number: '03',
    title: 'Send support',
    description: 'Choose an amount and send. Tipflow handles the routing automatically.',
  },
]

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'fans' | 'creators'>('fans')
  const steps = activeTab === 'fans' ? FAN_STEPS : CREATOR_STEPS

  return (
    <section id="how-it-works" className="py-14 md:py-20" style={{ background: '#0D0D14' }}>
      <div className="mx-auto max-w-[1280px] px-4">
        <h2 className="text-[28px] font-extrabold text-[var(--t)] text-center mb-6">
          Three steps to your first global tip
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--s1)',
              border: '1px solid var(--b)',
              borderRadius: '10px',
              padding: '4px',
            }}
          >
            {(['fans', 'creators'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab ? 'var(--or)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--ts)',
                  fontWeight: activeTab === tab ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                {tab === 'fans' ? 'For fans' : 'For creators'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={i < steps.length - 1 ? 'md:pr-6 md:border-r md:border-[rgba(249,115,22,0.15)]' : ''}
            >
              <div className="text-[52px] font-black leading-none" style={{ color: 'rgba(249,115,22,0.2)' }}>
                {step.number}
              </div>
              <h3 className="mt-2 text-base font-bold text-[var(--t)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--ts)] leading-[1.7]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
