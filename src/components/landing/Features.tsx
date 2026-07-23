'use client'
import { useInView } from '@/hooks/useInView'

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#F97316" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#F97316" strokeWidth={2}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#F97316" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <GlobeIcon />,
    title: 'Works everywhere',
    description: 'Fans authenticate with email from any country. No banking rails, no PayPal restrictions, no blocked regions.',
  },
  {
    icon: <BoltIcon />,
    title: 'Tips in 8 seconds',
    description:
      "Arbitrum's 2-second finality is why your fan's name appears on stream while they are still live — not after a 14-day platform hold.",
  },
  {
    icon: <ShieldIcon />,
    title: 'Transparent pricing',
    description: 'Tipflow charges 1% on successful tips. No monthly subscription. No hidden fees. Withdraw any time.',
  },
]

export function Features() {
  const { ref, inView } = useInView()
  return (
    <section
      ref={ref}
      id="for-streamers"
      className={`py-14 md:py-20 ${inView ? 'section-visible' : 'section-hidden'}`}
    >
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="text-center mb-8">
          <h2 className="text-[28px] font-extrabold text-[var(--t)]">Built for the creator economy</h2>
          <p className="mt-2 text-[var(--ts)]">Everything you need to get paid globally</p>
        </div>
        <div className="grid grid-cols-1 min-[640px]:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="relative overflow-hidden rounded-xl bg-s2 border border-[var(--b)] p-6"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange rounded-l-[3px]" />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(249,115,22,0.11)', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-[var(--t)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--ts)] leading-[1.7]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
