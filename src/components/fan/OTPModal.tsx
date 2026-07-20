'use client'
import { useRef, useState } from 'react'

interface OTPModalProps {
  email: string
  onVerify: (otp: string) => void
  onResend: () => void
  loading?: boolean
}

// Real Magic OTP verification. onVerify (implemented in TipCard) calls
// useMagicAuth().verifyOTP(otp), which resolves the fan's Magic wallet
// address and moves the flow on to sending.
export function OTPModal({ email, onVerify, onResend, loading }: OTPModalProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const complete = digits.every((d) => d)

  const handleVerify = () => {
    if (!complete || loading) return
    onVerify(digits.join(''))
  }

  return (
    <div>
      <div className="w-12 h-12 rounded-full bg-teal-dim flex items-center justify-center mb-4">
        <span className="text-teal text-xl">🔒</span>
      </div>
      <h2 className="text-xl font-extrabold text-[var(--t)]">Check your inbox</h2>
      <p className="mt-1 mb-5 text-sm text-[var(--ts)]">
        Code sent to <span className="text-orange">{email}</span>
      </p>
      <div className="flex gap-[7px] max-[374px]:gap-[5px] sm:gap-2 mb-5 justify-between">
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
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
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
        {loading ? 'Verifying…' : 'Verify and send tip'}
      </button>
      <button onClick={onResend} disabled={loading} className="mt-3 text-xs text-[var(--ts)] hover:text-[var(--t)] disabled:opacity-40">
        Resend code
      </button>
    </div>
  )
}

export default OTPModal
