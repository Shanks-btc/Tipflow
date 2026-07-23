export function CTABand() {
  return (
    <section
      id="pricing"
      className="border-b border-[var(--b)] py-14 md:py-20"
      style={{
        background: 'linear-gradient(135deg, #111118 0%, #1A0A00 100%)',
        borderTop: '1px solid rgba(249,115,22,0.3)',
      }}
    >
      <div className="mx-auto max-w-[1280px] px-4 flex flex-col min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between gap-6 text-center min-[640px]:text-left">
        <div>
          <h2 className="text-2xl min-[640px]:text-[32px] font-black text-[var(--t)]">
            Ready to earn from every fan, everywhere?
          </h2>
          <p className="mt-2 text-base text-[var(--ts)]">One tip link. One minute to set up.</p>
        </div>
        <a
          href="/login"
          className="btn-primary w-full min-[640px]:w-auto rounded-[10px] text-base font-bold text-white bg-orange text-center shrink-0"
          style={{ padding: '16px 32px' }}
        >
          Start for free
        </a>
      </div>
    </section>
  )
}

export default CTABand
