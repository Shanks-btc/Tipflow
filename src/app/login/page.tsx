'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMagicAuth } from '@/hooks/useMagicAuth'
import { APP_NAME } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const magicAuth = useMagicAuth()

  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleSendOTP = async () => {
    if (!email) return
    setError(null)
    try {
      await magicAuth.sendOTP(email)
      setOtpSent(true)
      setTimeout(() => refs.current[0]?.focus(), 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send the login code')
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
    try {
      const address = await magicAuth.verifyOTP(digits.join(''))
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, email }),
      })
      const data = await res.json()
      // tipflow_session only holds the wallet address — /setup needs email
      // too (to create the streamers row on first login), so it rides
      // along as a query param for this one redirect.
      router.push(data.exists ? '/dashboard' : `/setup?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify the code')
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

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
            {error}
          </div>
        )}

        <input
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent}
          className="mb-4"
        />

        {!otpSent ? (
          <button
            onClick={handleSendOTP}
            disabled={!email || magicAuth.loading}
            className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
          >
            {magicAuth.loading ? 'Sending…' : 'Continue with email'}
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
              disabled={!complete || magicAuth.loading}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
            >
              {magicAuth.loading ? 'Verifying…' : 'Verify and sign in'}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-xs text-[var(--ts)]">
          Fans: visit tipflow.app/tip/[streamer-name] to send a tip
        </p>
      </div>
    </main>
  )
}
