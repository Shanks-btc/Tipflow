'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { WS_URL } from '@/lib/constants'

type Step = 1 | 2 | 3
type CheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const USERNAME_PATTERN = /^[a-z0-9-]+$/i

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Set by /login's redirect (router.push(`/setup?email=...`)) right after
  // verifyOTP() — the tipflow_session cookie only holds the wallet address,
  // not email, so this is the one place email survives the login→setup hop.
  const email = searchParams.get('email') ?? ''

  const [step, setStep] = useState<Step>(1)
  const [username, setUsername] = useState('')
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced real-time availability check — one request per pause in
  // typing, not one per keystroke.
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current)

    if (!username) {
      setCheckStatus('idle')
      return
    }
    if (!USERNAME_PATTERN.test(username)) {
      setCheckStatus('invalid')
      return
    }

    setCheckStatus('checking')
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/streamers/${encodeURIComponent(username.toLowerCase())}`)
        setCheckStatus(res.status === 404 ? 'available' : 'taken')
      } catch {
        setCheckStatus('idle')
      }
    }, 400)

    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current)
    }
  }, [username])

  const handleContinueStep1 = async () => {
    if (checkStatus !== 'available' || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase(), email: email || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save username')
      setStep(2)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save username')
    } finally {
      setSaving(false)
    }
  }

  const overlayUrl = `tipflow.xyz/overlay/${username.toLowerCase()}`

  const handleCopyOverlayUrl = async () => {
    await navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendTestAlert = async () => {
    setTestStatus('sending')
    try {
      const res = await fetch(`${WS_URL}/test-alert/${username.toLowerCase()}`, { method: 'POST' })
      if (!res.ok) throw new Error(`WebSocket server returned ${res.status}`)
      setTestStatus('sent')
    } catch {
      setTestStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[640px] bg-s2 border border-[var(--b)] rounded-2xl p-6 sm:p-8">
        <div className="flex gap-[5px] mb-6 justify-center">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className="h-[3px] rounded-[2px] transition-all"
              style={{ width: s === step ? 22 : 7, background: s === step ? '#F97316' : '#1E1E2C' }}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-xl font-extrabold text-[var(--t)]">Choose your username</h1>
            <p className="mt-1 mb-5 text-sm text-[var(--ts)]">
              This is your public tip link — tipflow.xyz/tip/[your-username]
            </p>

            <input
              type="text"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
              autoFocus
              className="mb-2 font-mono"
            />

            <div className="mb-5 min-h-[20px] text-sm">
              {checkStatus === 'checking' && <span className="text-[var(--ts)]">Checking…</span>}
              {checkStatus === 'available' && (
                <span className="text-teal flex items-center gap-1.5">
                  <span>✓</span> Available
                </span>
              )}
              {checkStatus === 'taken' && (
                <span className="text-red-400 flex items-center gap-1.5">
                  <span>✕</span> Already taken
                </span>
              )}
              {checkStatus === 'invalid' && (
                <span className="text-red-400">Letters, numbers, and hyphens only</span>
              )}
            </div>

            {saveError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
                {saveError}
              </div>
            )}

            <button
              onClick={handleContinueStep1}
              disabled={checkStatus !== 'available' || saving}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
            >
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-extrabold text-[var(--t)]">Set up your stream alerts</h1>
            <p className="mt-1 mb-5 text-sm text-[var(--ts)]">
              When fans tip you, their name appears live on your stream. Add this URL to OBS.
            </p>

            <div className="flex items-center justify-between gap-3 bg-orange-dim border border-[var(--orb)] rounded-[10px] px-4 py-3.5 mb-5">
              <span className="min-w-0 flex-1 font-mono text-orange text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                {overlayUrl}
              </span>
              <button
                onClick={handleCopyOverlayUrl}
                className="shrink-0 text-orange text-xs font-semibold border border-[var(--orb)] rounded-lg px-3 py-1.5"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-3">
              {[
                'Open OBS Studio on your computer',
                'Add a Browser Source and paste your URL above',
                'Set size to 1920×1080 and click OK',
              ].map((instruction, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-s1 border border-[var(--b)] flex items-center justify-center text-xs font-bold text-[var(--t)] shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[var(--ts)] pt-0.5">{instruction}</p>
                </div>
              ))}
            </div>

            <p className="mb-6 text-xs text-[var(--tm)]">
              Don&apos;t use OBS? Skip this for now — you can set it up later from your dashboard.
            </p>

            <button
              onClick={() => setStep(3)}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange"
            >
              Next
            </button>

            <a
              href="/dashboard"
              className="mt-3 block text-center"
              style={{ color: 'var(--ts)', fontSize: '13px' }}
            >
              Skip for now →
            </a>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-extrabold text-[var(--t)]">You are almost ready!</h1>
            <p className="mt-1 mb-6 text-sm text-[var(--ts)]">Send a test alert to make sure everything is working.</p>

            <button
              onClick={handleSendTestAlert}
              disabled={testStatus === 'sending'}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity mb-3"
            >
              {testStatus === 'sending' ? 'Sending…' : 'Test my stream alert'}
            </button>

            <p className="mb-3 text-xs text-center text-[var(--tm)]">
              No OBS? You can test alerts anytime from your dashboard.
            </p>

            <div className="min-h-[20px] mb-6 text-sm text-center">
              {testStatus === 'sent' && <span className="text-teal">Alert sent! Check your overlay</span>}
              {testStatus === 'error' && <span className="text-red-400">Failed to send — is the overlay server running?</span>}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-[10px] py-[14px] font-bold text-[var(--t)] bg-transparent border border-[var(--b)]"
            >
              I am ready → Go to my dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#09090F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '2.5px solid rgba(249,115,22,0.2)',
              borderTopColor: '#F97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  )
}
