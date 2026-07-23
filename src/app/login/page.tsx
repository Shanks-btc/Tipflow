'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { APP_NAME } from '@/lib/constants'

// This route has no server-side data dependency, so Next.js treats it as
// fully static and (per the production Cache-Control header we observed:
// `s-maxage=31536000, stale-while-revalidate`) it can be cached at
// Railway's edge layer for up to a year. That's independent of any
// visiting device's own cache — a stale edge-cached snapshot from an
// earlier, since-fixed deploy can keep being served to new visitors long
// after the underlying code is corrected. Forcing dynamic rendering
// removes /login from that static-caching path entirely, so it's always
// served fresh from the current deployment.
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Safety: ensure error is always a displayable string
  const displayError = error &&
    typeof error === 'string' &&
    error !== '{}' &&
    error !== '[object Object]' &&
    error.length > 0 ? error : null

  const handleSendOTP = async () => {
    if (!email) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send the login code')
      setOtpSent(true)
      setTimeout(() => refs.current[0]?.focus(), 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send the login code')
    } finally {
      setLoading(false)
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) refs.current[index + 1]?.focus()
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: digits.join('') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to verify the code')
      router.push(data.redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify the code')
    } finally {
      setLoading(false)
    }
  }

  const complete = digits.every((d) => d)

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-s2 border border-[var(--b)] rounded-2xl p-6">
        <div className="text-center mb-6">
          <span className="text-lg font-extrabold text-[var(--t)]">{APP_NAME}</span>
        </div>
        <h1 className="text-xl font-extrabold text-[var(--t)] text-center mb-6">Sign in to your account</h1>

        {displayError &&
          typeof displayError === 'string' &&
          displayError.length > 0 &&
          displayError !== '{}' &&
          displayError !== '[object Object]' && (
            <div
              style={{
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: 'var(--or)',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {displayError}
            </div>
          )}

        <input
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent}
          className="mb-2"
        />
        {!otpSent && (
          <p className="mb-4 text-xs text-[var(--ts)]">
            We will send a 6-digit code to your email. No wallet or password required.
          </p>
        )}

        {!otpSent ? (
          <button
            onClick={handleSendOTP}
            disabled={!email || loading}
            className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Sending…' : 'Continue with email'}
          </button>
        ) : (
          <>
            <div className="flex gap-[7px] max-[374px]:gap-[5px] sm:gap-2 mb-4 justify-between">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  className="text-center font-extrabold text-[22px] p-0 w-10 h-[50px] max-[374px]:w-9 max-[374px]:h-[46px] sm:w-[45px] sm:h-[54px]"
                  style={{ borderColor: digit ? '#F97316' : undefined }}
                />
              ))}
            </div>
            <button
              onClick={handleVerify}
              disabled={!complete || loading}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
            >
              {loading ? 'Verifying…' : 'Verify and sign in'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
