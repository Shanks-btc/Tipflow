'use client'
import { useEffect, useState } from 'react'
import LiveDot from '@/components/shared/LiveDot'
import TypewriterText from './TypewriterText'

// Decorative only — a static mockup of the real fan tip page (StreamerCard,
// AmountSelector, TipCard's send button) and OBS alert (AlertCard.tsx),
// styled to match but with no state, hooks, or Magic/Particle/socket.io
// dependencies — every "button" here is a styled <div>, not a real
// interactive element.
//
// Two variants render across the responsive range (see Hero() below for
// which breakpoints show which):
//   - Desktop (lg+): full card + floating alert card, side-by-side with
//     the headline text.
//   - Below lg (mobile + tablet, <1024px): a simplified card (no "choose
//     an amount" label, no alert card), stacked below the CTAs instead of
//     beside the text.

function StreamerRow() {
  return (
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
  )
}

function AmountGrid() {
  return (
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
  )
}

function SendButton() {
  return (
    <div
      role="presentation"
      className="w-full rounded-[10px] font-bold text-white text-center"
      style={{ background: '#F97316', padding: '13px 0' }}
    >
      Send $5
    </div>
  )
}

// Below lg (mobile + tablet) — simplified card, visible below the CTAs.
// Distinct sizing from StreamerRow/AmountGrid above (40px avatar not
// 44px, 18px amount font not 20px), so built as its own self-contained
// component rather than parameterizing the shared ones for two callers.
function MobileTipCardPreview() {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: '#18181F',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '100%',
      }}
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
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: 40, height: 40, background: '#F97316' }}
        >
          <span className="text-white font-bold text-[15px]">N</span>
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-[var(--t)]">NightOwl</div>
          <div className="flex items-center gap-1.5 mt-1">
            <LiveDot />
            <span className="text-[12px] text-[var(--ts)]">Live · 2.4K watching</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[1, 3, 5, 10].map((amount) => (
          <div
            key={amount}
            className="rounded-[10px] text-center"
            style={{
              padding: '12px 0',
              fontSize: '18px',
              fontWeight: '900',
              ...(amount === 5
                ? { background: 'rgba(249,115,22,0.11)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }
                : { background: '#111118', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--t)' }),
            }}
          >
            ${amount}
          </div>
        ))}
      </div>

      <SendButton />

      <div className="mt-3 text-center" style={{ fontSize: '11px', color: '#444455' }}>
        No wallet · No MetaMask · 195 countries
      </div>
    </div>
  )
}

// Desktop + tablet — full card content.
function TipCardPreview() {
  return (
    <div
      className="rounded-2xl bg-s2 p-5"
      style={{ border: '1px solid rgba(249,115,22,0.2)', boxShadow: '0 0 40px rgba(249,115,22,0.05)' }}
    >
      <StreamerRow />
      <div className="text-[11px] uppercase text-[var(--tm)] mb-2" style={{ letterSpacing: '0.06em' }}>
        Choose an amount
      </div>
      <AmountGrid />
      <SendButton />
      <div className="mt-3 text-center text-[11px]" style={{ color: '#444455' }}>
        No wallet · No MetaMask · 1% fee
      </div>
    </div>
  )
}

function AlertCardPreview({ visible }: { visible: boolean }) {
  return (
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
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s ease, opacity 0.5s ease',
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
  )
}

export function Hero() {
  const [alertVisible, setAlertVisible] = useState(false)

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>
    let hideTimer: ReturnType<typeof setTimeout>
    let loopTimer: ReturnType<typeof setTimeout>

    const cycle = () => {
      showTimer = setTimeout(() => {
        setAlertVisible(true)
        hideTimer = setTimeout(() => {
          setAlertVisible(false)
          loopTimer = setTimeout(cycle, 3000)
        }, 4000)
      }, 2000)
    }
    cycle()

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(loopTimer)
    }
  }, [])

  return (
    <section className="pt-12 pb-12 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-4 lg:flex lg:items-center lg:gap-12">
        <div className="lg:w-[52%] text-center lg:text-left">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-5 text-teal"
            style={{ background: 'var(--tld)', border: '1px solid var(--tlb)', fontSize: 11, fontWeight: 600 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34D399', animation: 'pulseDot 1.6s ease-in-out infinite' }}
            />
            Settles on Arbitrum
          </div>

          <h1 className="font-extrabold text-[32px] md:text-[36px] lg:text-[48px] leading-[1.05] text-[var(--t)]">
            Fans anywhere.
            <br />
            Tips instantly.
            <br />
            <TypewriterText
              text="Zero friction."
              style={{ color: 'var(--or)', textShadow: '0 0 40px rgba(249,115,22,0.3)' }}
            />
          </h1>
          <p className="mt-4 max-w-[520px] mx-auto lg:mx-0 text-[var(--ts)] text-base">
            No MetaMask. No PayPal. No wallet setup.
            <br />
            Fans anywhere in the world tip with just their email,
            <br />
            you get paid in 8 seconds.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="/login"
              className="btn-primary w-full sm:w-auto rounded-[10px] py-[14px] px-6 font-bold text-white bg-orange text-center"
            >
              Get your free tip link
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto rounded-[10px] font-bold text-[var(--t)] bg-transparent text-center"
              style={{ border: '1.5px solid rgba(255,255,255,0.25)', padding: '13px 22px' }}
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-[var(--tm)]">Free to start · 1% per tip · Withdraw anytime</p>

          {/* Below lg (mobile + tablet): simplified card, always visible, stacked below the CTAs. */}
          <div className="lg:hidden" style={{ marginTop: 32 }}>
            <MobileTipCardPreview />
          </div>
        </div>

        {/* Desktop (1024px+): full card + floating alert, beside the text. */}
        <div className="hidden lg:block lg:w-[48%]">
          <div className="relative w-full max-w-[380px] mx-auto" style={{ minHeight: 360 }}>
            <TipCardPreview />
            <AlertCardPreview visible={alertVisible} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
