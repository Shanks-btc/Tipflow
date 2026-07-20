const TESTIMONIALS = [
  {
    quote: 'I got tipped by a fan in the Philippines who never could have paid me before.',
    handle: '@StreamerXYZ',
  },
  {
    quote: 'Setup took 2 minutes. First tip arrived in 8 seconds. This is insane.',
    handle: '@GamingCreator',
  },
  {
    quote: 'Finally something that works globally without the 30% Twitch cut.',
    handle: '@ContentMaker',
  },
]

export function SocialProof() {
  return (
    <section className="bg-s1 border-t border-b border-[var(--b)] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4">
        <h2 className="text-center text-xl font-extrabold text-[var(--t)] mb-8">
          Trusted by streamers in 195 countries
        </h2>
        <div className="grid grid-cols-1 min-[640px]:grid-cols-3 gap-4">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.handle}
              className="rounded-xl bg-s2 border border-[var(--b)] p-5"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'rgba(249,115,22,0.11)', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                <span className="text-orange text-[18px] font-bold">{testimonial.handle.charAt(1).toUpperCase()}</span>
              </div>
              <div className="text-orange text-sm mb-3" aria-hidden="true">★★★★★</div>
              <p className="text-[15px] text-[var(--t)] italic leading-[1.7] mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="text-[13px] font-semibold text-[var(--ts)]">{testimonial.handle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProof
