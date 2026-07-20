import { APP_NAME } from '@/lib/constants'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For streamers', href: '#for-streamers' },
  { label: 'Pricing', href: '#fee-comparison' },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-s1 border-b border-[var(--b)]">
      <div className="mx-auto max-w-[1280px] px-4 py-4 flex items-center justify-between">
        <span className="text-lg font-extrabold text-white">{APP_NAME}</span>

        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--ts)] hover:text-[var(--t)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden md:inline-block px-4 py-2 rounded-lg bg-transparent border border-[var(--b)] text-[var(--t)] text-sm font-semibold"
          >
            Log in
          </a>
          <a href="/login" className="px-4 py-2 rounded-lg bg-orange text-white text-sm font-semibold">
            Get tip link
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
