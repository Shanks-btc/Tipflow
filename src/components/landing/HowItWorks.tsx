const STEPS = [
  {
    number: '01',
    title: 'Sign up free',
    description: 'Login with your email. No wallet setup needed. Your tip link is ready in under 30 seconds.',
  },
  {
    number: '02',
    title: 'Share your link',
    description: 'Post tipflow.app/tip/you on Twitch, your bio, Discord — anywhere your fans are watching.',
  },
  {
    number: '03',
    title: 'Get paid worldwide',
    description: 'Every fan, every country. You receive USDC on Arbitrum in seconds. Withdraw whenever you want.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 md:py-20" style={{ background: '#0D0D14' }}>
      <div className="mx-auto max-w-[1280px] px-4">
        <h2 className="text-[28px] font-extrabold text-[var(--t)] text-center mb-8">
          Three steps to your first global tip
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={i < STEPS.length - 1 ? 'md:pr-6 md:border-r md:border-[rgba(249,115,22,0.15)]' : ''}
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
