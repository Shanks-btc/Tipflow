import LiveDot from '@/components/shared/LiveDot'

// Decorative only — a static mockup of the real fan tip page (StreamerCard,
// AmountSelector, TipCard's send button) and OBS alert (AlertCard.tsx),
// styled to match but with no state, hooks, or Magic/Particle/socket.io
// dependencies — every "button" here is a styled <div>, not a real
// interactive element. Purely a desktop-only visual, hidden below the
// split-layout breakpoint (lg = 1024px in this project's tailwind.config.ts).
function ProductPreview() {
  return (
    <div className="relative hidden lg:block w-full max-w-[380px] mx-auto" style={{ minHeight: 360 }}>
      <div
        className="rounded-2xl bg-s2 p-5"
        style={{ border: '1px solid rgba(249,115,22,0.2)', boxShadow: '0 0 40px rgba(249,115,22,0.05)' }}
      >
        <div
          className="rounded-xl mb-4"
          style={{
            background: 'rgba(249,115,22,0.11)',
            border: '1px solid rgba(249,115,22,0.25)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F97316' }}>
            <span className="text-white font-bold text-[16px]">N</span>
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-[var(--t)]">NightOwl</div>
            <div className="flex items-center gap-1.5 mt-1">
              <LiveDot />
              <span className="text-[12px] text-[var(--ts)]">Live · 2.4K watching</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] uppercase text-[var(--tm)] mb-2" style={{ letterSpacing: '0.06em' }}>
          Choose an amount
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 3, 5, 10].map((amount) => (
            <div
              key={amount}
              className="rounded-[10px] py-3 text-center font-black text-[20px]"
              style={
                amount === 5
                  ? { background: 'rgba(249,115,22,0.11)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }
                  : { background: '#111118', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--t)' }
              }
            >
              ${amount}
            </div>
          ))}
        </div>

        <div
          role="presentation"
          className="w-full rounded-[10px] font-bold text-white text-center"
          style={{ background: '#F97316', padding: '13px 0' }}
        >
          Send $5 →
        </div>
        <div className="mt-3 text-center text-[11px]" style={{ color: '#444455' }}>
          No wallet · No MetaMask · 195 countries
        </div>
      </div>

      <div
        className="absolute -bottom-6 -right-6"
        style={{
          position: 'absolute',
          background: 'rgba(10,8,5,0.93)',
          border: '1px solid rgba(249,115,22,0.45)',
          borderRadius: 14,
          padding: '14px 18px',
          width: 240,
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: '#F97316' }} />
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: 'rgba(249,115,22,0.11)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }}
          >
            J
          </div>
          <div className="min-w-0">
            <div className="text-white text-[15px] font-bold">jules tipped $5</div>
            <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Best stream ever! 🎮
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="pt-12 pb-14 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-[1280px] px-4 lg:flex lg:items-center lg:gap-12">
        <div className="lg:w-[52%]">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-5 text-teal"
            style={{ background: 'var(--tld)', border: '1px solid var(--tlb)', fontSize: 11, fontWeight: 600 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34D399', animation: 'pulseDot 1.6s ease-in-out infinite' }}
            />
            Live on Arbitrum · Particle Universal Accounts
          </div>

          <h1 className="font-extrabold text-[36px] sm:text-[40px] lg:text-[48px] leading-[1.05] text-[var(--t)]">
            Fans anywhere.
            <br />
            Tips instantly.
            <br />
            <span className="text-orange" style={{ textShadow: '0 0 40px rgba(249,115,22,0.3)' }}>
              Zero friction.
            </span>
          </h1>
          <p className="mt-4 max-w-[520px] text-[var(--ts)] text-base">
            No MetaMask. No PayPal. No platform cut.
            <br />
            Fans anywhere in the world tip with just their email —
            <br />
            you get paid in 8 seconds.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="/login"
              className="rounded-[10px] py-[14px] px-6 font-bold text-white bg-orange text-center"
            >
              Get your free tip link →
            </a>
            <a
              href="#how-it-works"
              className="rounded-[10px] font-bold text-[var(--t)] bg-transparent text-center"
              style={{ border: '1.5px solid rgba(255,255,255,0.25)', padding: '13px 22px' }}
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-[var(--tm)]">Free to start · 1% per tip · Withdraw anytime</p>
        </div>

        <div className="lg:w-[48%] mt-10 lg:mt-0">
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}

export default Hero
