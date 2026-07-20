'use client'
import { useRef, useState } from 'react'
import { useMagicAuth } from '@/hooks/useMagicAuth'
import { useParticleUA } from '@/hooks/useParticleUA'
import type { Streamer } from '@/lib/streamers'
import StreamerCard from './StreamerCard'
import AmountSelector from './AmountSelector'
import EmailModal from './EmailModal'
import OTPModal from './OTPModal'
import SendingState from './SendingState'
import SuccessState from './SuccessState'

type TipCardStep = 'select' | 'email' | 'otp' | 'sending' | 'success' | 'error'

const PROGRESS_STEPS: Exclude<TipCardStep, 'error'>[] = ['select', 'email', 'otp', 'sending', 'success']

interface TipCardProps {
  username: string
  // Fetched server-side by the page (Server Component) before this client
  // component ever loads — no client-side fetch/loading state needed here.
  initialStreamer: Streamer | null
}

export default function TipCard({ username, initialStreamer }: TipCardProps) {
  const magicAuth = useMagicAuth()
  const particleUA = useParticleUA()

  const [step, setStep] = useState<TipCardStep>('select')
  const [amount, setAmount] = useState<number | null>(null)
  const [message] = useState('')
  const [email, setEmail] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Guards against double-sending — verifyOTP resolves once, but this keeps
  // a retry from firing a second real transaction.
  const hasSentRef = useRef(false)

  const displayName = initialStreamer?.display_name ?? username.charAt(0).toUpperCase() + username.slice(1)

  const handleSelectAmount = (n: number) => {
    setAmount(n)
    setStep('email')
  }

  const handleSendOTP = async () => {
    setAuthError(null)
    try {
      await magicAuth.sendOTP(email)
      setStep('otp')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to send the login code')
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    setAuthError(null)
    try {
      await magicAuth.verifyOTP(otp)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to verify the code')
      return
    }

    if (hasSentRef.current) return
    hasSentRef.current = true

    if (!amount || !initialStreamer) {
      setError('Missing amount or streamer data')
      setStep('error')
      return
    }

    setError(null)
    setStep('sending')
    const startedAt = Date.now()
    try {
      const signer = magicAuth.getSigner()
      const id = await particleUA.sendTip({
        signer,
        streamerUA: initialStreamer.ua_address,
        amountUsd: amount,
      })
      setTxHash(id)
      setElapsedSeconds(Math.round((Date.now() - startedAt) / 1000))
      setStep('success')

      // Best-effort — the on-chain tip already succeeded regardless of
      // whether this recording call succeeds.
      fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId: initialStreamer.id,
          fanEmail: email,
          amountUsd: amount,
          message,
          txHash: id,
          sourceChain: 'arbitrum',
        }),
      }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip')
      setStep('error')
    }
  }

  const handleReset = async () => {
    hasSentRef.current = false
    await magicAuth.logout()
    setStep('select')
    setAmount(null)
    setEmail('')
    setTxHash(null)
    setError(null)
    setAuthError(null)
  }

  const handleTryAgain = () => {
    hasSentRef.current = false
    setError(null)
    setStep('select')
  }

  // Explicit-only, per the DEV MODE banner's "Clear wallet" button — never
  // triggered automatically.
  const handleClearFallbackWallet = () => {
    magicAuth.clearFallbackWallet()
    hasSentRef.current = false
    setStep('select')
    setAmount(null)
    setEmail('')
    setAuthError(null)
  }

  const stepIndex = step === 'error' ? PROGRESS_STEPS.indexOf('otp') : PROGRESS_STEPS.indexOf(step)

  if (!initialStreamer) {
    return (
      <div className="w-full max-w-[390px] mx-auto relative overflow-hidden rounded-2xl bg-s2 border border-[var(--b)] p-5 sm:p-6 text-center">
        <h2 className="text-lg font-extrabold text-[var(--t)] mb-2">Streamer not found</h2>
        <p className="text-sm text-[var(--ts)]">@{username} doesn&apos;t have a Tipflow page yet.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[390px] mx-auto relative overflow-hidden rounded-2xl bg-s2 border border-[var(--b)] p-5 sm:p-6">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }}
      />

      <div className="flex gap-[5px] mb-6">
        {PROGRESS_STEPS.map((s, i) => (
          <div
            key={s}
            className="h-[3px] rounded-[2px] transition-all"
            style={{
              width: i === stepIndex ? 22 : 7,
              background: i === stepIndex ? '#F97316' : '#1E1E2C',
            }}
          />
        ))}
      </div>

      {authError && (step === 'email' || step === 'otp') && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
          {authError}
        </div>
      )}

      {magicAuth.usingFallback && step === 'otp' && (
        <div className="mb-4 rounded-lg border border-[var(--orb)] bg-orange-dim text-center overflow-hidden">
          <div className="p-2 text-orange text-[11px]">
            <div>DEV MODE — Magic timed out, reusing your persisted local test wallet (localhost only)</div>
            {magicAuth.fallbackAddress && (
              <>
                <div className="mt-1 text-[var(--tm)] uppercase" style={{ letterSpacing: '0.06em' }}>Address (same every time)</div>
                <div className="font-mono break-all select-all">{magicAuth.fallbackAddress}</div>
              </>
            )}
            <div className="mt-1 text-[var(--tm)]">Fund this address once with a small amount of ETH on Arbitrum — it persists until you clear it</div>
          </div>

          {magicAuth.fallbackPrivateKey && (
            <div className="p-2 border-t border-red-500/30 bg-red-500/10 text-left">
              <div className="text-red-300 text-[10px] uppercase font-bold text-center" style={{ letterSpacing: '0.06em' }}>
                Private key — test only, never use in production
              </div>
              <div className="mt-1 font-mono text-red-300 text-[10px] break-all select-all">
                {magicAuth.fallbackPrivateKey}
              </div>
            </div>
          )}

          <button
            onClick={handleClearFallbackWallet}
            className="w-full py-2 text-[11px] font-semibold text-[var(--ts)] border-t border-[var(--b)] hover:text-[var(--t)]"
          >
            Clear wallet
          </button>
        </div>
      )}

      {step === 'select' && (
        <div>
          <StreamerCard displayName={displayName} />
          <AmountSelector selected={amount} onSelect={handleSelectAmount} />
        </div>
      )}

      {step === 'email' && amount !== null && (
        <EmailModal
          amount={amount}
          streamerName={displayName}
          email={email}
          onEmailChange={setEmail}
          onContinue={handleSendOTP}
          onBack={() => setStep('select')}
          loading={magicAuth.loading}
        />
      )}

      {step === 'otp' && (
        <OTPModal email={email} onVerify={handleVerifyOTP} onResend={handleSendOTP} loading={magicAuth.loading} />
      )}

      {step === 'sending' && amount !== null && (
        <SendingState amount={amount} streamerName={displayName} />
      )}

      {step === 'success' && amount !== null && txHash && (
        <SuccessState
          amount={amount}
          streamerName={displayName}
          message={message || undefined}
          elapsedSeconds={elapsedSeconds}
          onTipAgain={handleReset}
        />
      )}

      {step === 'error' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="text-[22px] font-black text-red-400 mb-4">Tip failed</h2>
          <pre className="bg-s1 rounded-lg p-3 mb-4 text-left text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
            {error}
          </pre>
          <button
            onClick={handleTryAgain}
            className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
