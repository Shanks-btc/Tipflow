'use client'
import { useEffect, useState } from 'react'
import { HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers'
import { useParticleUA } from '@/hooks/useParticleUA'
import { ARBITRUM_RPC } from '@/lib/constants'
import type { AuthorizationSignature, TipSigner } from '@/lib/tipSigner'

// EDIT ME (or use the live "Recipient" field below): an Arbitrum address you
// control, to receive the test tip.
const DEFAULT_TEST_RECIPIENT = ''

type Step = 'generate' | 'reveal' | 'wallet' | 'sending' | 'result'
const STEPS: Step[] = ['generate', 'reveal', 'wallet', 'sending', 'result']

type LogEntry = { time: string; message: string }

function truncate(address: string) {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function timestamp() {
  return new Date().toTimeString().slice(0, 8)
}

// Best-effort scan for a raw on-chain tx hash anywhere in Particle's
// (loosely-typed) transaction-details response, since the exact response
// shape for a settled Universal Account transaction isn't publicly typed.
function findTxHash(value: unknown, depth = 0): string | null {
  if (depth > 6 || value == null) return null
  if (typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value)) return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTxHash(item, depth + 1)
      if (found) return found
    }
    return null
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      const found = findTxHash(v, depth + 1)
      if (found) return found
    }
  }
  return null
}

// TEMPORARY, test-page-only signer: wraps a locally-generated ethers wallet
// instead of Magic, so the Particle Universal Account flow can be verified
// independently while Magic's API key issue is being fixed. Not used by any
// production code path — useTipFlow.ts still goes through Magic.
function createTestWalletSigner(wallet: HDNodeWallet): TipSigner {
  return {
    address: wallet.address,
    async signMessage(bytes: Uint8Array): Promise<string> {
      return wallet.signMessage(bytes)
    },
    async signAuthorization({ contractAddress, chainId, nonce }): Promise<AuthorizationSignature> {
      const auth = await wallet.authorize({ address: contractAddress, chainId, nonce })
      return {
        contractAddress: auth.address,
        chainId: Number(auth.chainId),
        nonce: Number(auth.nonce),
        v: auth.signature.v,
        r: auth.signature.r,
        s: auth.signature.s,
      }
    },
    async sendType4Transaction({ to, data, authorizationList }) {
      const tx = await wallet.sendTransaction({
        to,
        data,
        type: 4,
        authorizationList: authorizationList.map((a) => ({
          address: a.contractAddress,
          chainId: a.chainId,
          nonce: a.nonce,
          signature: { v: a.v, r: a.r, s: a.s },
        })),
      })
      const receipt = await tx.wait()
      return { transactionHash: receipt?.hash ?? tx.hash }
    },
  }
}

export default function TipTestPage() {
  const particleUA = useParticleUA()

  const [step, setStep] = useState<Step>('generate')
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | null>(null)

  const [testWallet, setTestWallet] = useState<HDNodeWallet | null>(null)

  const [recipient, setRecipient] = useState(DEFAULT_TEST_RECIPIENT)
  const [delegation, setDelegation] = useState<'pending' | 'active'>('pending')

  const [txId, setTxId] = useState<string | null>(null)
  const [onChainHash, setOnChainHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)

  const [logs, setLogs] = useState<LogEntry[]>([])
  const log = (message: string) => setLogs((prev) => [...prev, { time: timestamp(), message }])

  useEffect(() => {
    if (step !== 'wallet' || !testWallet) return
    particleUA
      .checkDelegation(testWallet.address)
      .then((isDelegated) => setDelegation(isDelegated ? 'active' : 'pending'))
      .catch(() => setDelegation('pending'))
  }, [step, testWallet, particleUA])

  const stepIndex = STEPS.indexOf(step)

  // --- Step 1: generate ---
  const handleGenerateWallet = () => {
    setErrorMessage(null)
    const provider = new JsonRpcProvider(ARBITRUM_RPC)
    const wallet = Wallet.createRandom(provider)
    setTestWallet(wallet)
    log(`Test wallet generated — address: ${wallet.address}`)
    setStep('reveal')
  }

  // --- Step 2: reveal ---
  const handleContinueToWallet = () => {
    setStep('wallet')
  }

  const handleGenerateDifferent = () => {
    setErrorMessage(null)
    setTestWallet(null)
    setStep('generate')
  }

  // --- Step 3: wallet / send ---
  const handleSendTip = async () => {
    if (!testWallet) return
    if (!recipient || !recipient.startsWith('0x')) {
      setErrorMessage('Enter a valid Arbitrum recipient address first')
      return
    }
    setErrorMessage(null)
    setStep('sending')
    setSending(true)
    try {
      const signer = createTestWalletSigner(testWallet)
      const id = await particleUA.sendTip({
        signer,
        streamerUA: recipient,
        amountUsd: 1,
        onProgress: (message) => {
          log(message)
          if (/delegation/i.test(message) && /(already active|confirmed)/i.test(message)) {
            setDelegation('active')
          }
        },
      })
      setTxId(id)
      setResultStatus('success')
      setStep('result')

      // Best-effort: poll briefly for a resolvable on-chain hash.
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 2000))
        try {
          const details = await particleUA.getTransactionDetails(testWallet.address, id)
          const hash = findTxHash(details)
          if (hash) {
            setOnChainHash(hash)
            log(`Confirmed on Arbitrum — hash ${hash}`)
            break
          }
        } catch {
          // keep polling silently — surfaced errors here would be misleading
          // since the tip itself already succeeded
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setErrorMessage(message)
      setResultStatus('error')
      setStep('result')
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async () => {
    if (!txId) return
    await navigator.clipboard.writeText(txId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleReset = () => {
    setStep('generate')
    setResultStatus(null)
    setTestWallet(null)
    setTxId(null)
    setOnChainHash(null)
    setErrorMessage(null)
    setDelegation('pending')
  }

  const handleTryAgain = () => {
    setErrorMessage(null)
    setResultStatus(null)
    setStep('wallet')
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] relative overflow-hidden rounded-2xl bg-s2 border border-[var(--b)] p-7">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }}
        />

        <span
          className="inline-block bg-orange-dim border border-[var(--orb)] text-orange rounded-full px-2.5 py-1 text-[11px] uppercase mb-4"
          style={{ letterSpacing: '0.08em' }}
        >
          Phase 2 Integration Test
        </span>

        <div className="flex gap-[5px] mb-6">
          {STEPS.map((s, i) => (
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

        {errorMessage && step !== 'result' && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
            {errorMessage}
          </div>
        )}

        {step === 'generate' && (
          <div>
            <h1 className="text-xl font-extrabold text-[var(--t)]">Generate a test wallet</h1>
            <p className="mt-1 mb-5 text-sm text-[var(--ts)]">
              Magic login is temporarily down (invalid API key). Use a disposable local wallet to verify
              the Particle Universal Account flow independently while that gets fixed.
            </p>
            <button
              onClick={handleGenerateWallet}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange transition-opacity"
            >
              Generate Test Wallet
            </button>
          </div>
        )}

        {step === 'reveal' && testWallet && (
          <div>
            <h1 className="text-xl font-extrabold text-[var(--t)]">Test wallet ready</h1>
            <p className="mt-1 mb-4 text-sm text-[var(--ts)]">
              A random wallet was generated locally in your browser. It exists only in this session.
            </p>

            <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10">
              <div className="text-red-300 text-xs font-extrabold uppercase" style={{ letterSpacing: '0.06em' }}>
                Test only — never use in production
              </div>
              <p className="mt-1 text-red-300/80 text-[11px]">
                This private key is generated and displayed in plain text for local testing only. Never fund it
                with real value beyond a trivial Arbitrum gas amount, never reuse it, never ship this flow.
              </p>
            </div>

            <div className="bg-s1 rounded-lg p-3 mb-3">
              <div className="text-[11px] uppercase text-[var(--tm)] mb-1">Address</div>
              <div className="font-mono text-[var(--t)] text-sm break-all">{testWallet.address}</div>
            </div>

            <div className="bg-s1 rounded-lg p-3 mb-5 border border-red-500/20">
              <div className="text-[11px] uppercase text-red-300/70 mb-1">Private Key</div>
              <div className="font-mono text-red-300 text-xs break-all">{testWallet.privateKey}</div>
            </div>

            <button
              onClick={handleContinueToWallet}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange transition-opacity"
            >
              Continue to Universal Account test
            </button>
            <button
              onClick={handleGenerateDifferent}
              className="mt-3 text-xs text-[var(--ts)] hover:text-[var(--t)]"
            >
              Generate a different wallet
            </button>
          </div>
        )}

        {step === 'wallet' && testWallet && (
          <div>
            <div className="w-[34px] h-[34px] rounded-full bg-teal-dim flex items-center justify-center mb-3">
              <span className="text-teal text-sm">✓</span>
            </div>
            <h1 className="text-lg font-extrabold text-[var(--t)] mb-4">Wallet connected</h1>

            <div className="bg-s1 rounded-lg p-3 mb-4">
              <div className="text-[11px] uppercase text-[var(--tm)] mb-1">Test Wallet Address</div>
              <div className="font-mono text-[var(--t)] break-all">{truncate(testWallet.address)}</div>
            </div>

            <label className="block text-xs text-[var(--ts)] mb-1">Test recipient address (Arbitrum)</label>
            <input
              type="text"
              placeholder="0x... paste an Arbitrum address you control"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono mb-4"
            />

            <div className="flex items-center justify-between bg-orange-dim border border-[var(--orb)] rounded-[10px] px-4 py-3.5 mb-3">
              <span className="text-[13px] text-[var(--ts)]">Test tip amount</span>
              <span className="text-lg font-black text-orange">$1.00</span>
            </div>

            <div className="mb-3 text-xs">
              {delegation === 'active' ? (
                <span className="text-teal">EIP-7702 delegation: Active ✓</span>
              ) : (
                <span className="text-[var(--ts)]">EIP-7702 delegation: Pending</span>
              )}
            </div>

            {delegation !== 'active' && (
              <p className="mb-5 text-[11px] text-[var(--tm)]">
                This wallet has no Magic relayer behind it — it pays its own gas. Fund{' '}
                <span className="font-mono text-[var(--ts)]">{truncate(testWallet.address)}</span> with a small
                amount of ETH on Arbitrum first, or the delegation transaction below will fail with
                insufficient funds.
              </p>
            )}

            <button
              onClick={handleSendTip}
              disabled={!recipient || sending || particleUA.loading}
              className="w-full rounded-[10px] py-[14px] font-bold text-white bg-orange disabled:opacity-40 transition-opacity"
            >
              Send $1 test tip
            </button>
          </div>
        )}

        {step === 'sending' && (
          <div className="flex flex-col items-center text-center py-6">
            <div
              className="rounded-full mb-5"
              style={{
                width: 56,
                height: 56,
                border: '2.5px solid var(--b)',
                borderTopColor: '#F97316',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <h1 className="text-xl font-extrabold text-[var(--t)]">Routing your $1 tip</h1>
            <p className="mt-1 mb-5 text-sm text-[var(--ts)]">Processing via Particle Universal Accounts</p>
            <div className="bg-s1 border border-[var(--b)] rounded-full px-4 py-2 text-xs font-mono flex items-center gap-2">
              <span className="text-[var(--ts)]">BSC</span>
              <span className="text-[var(--tm)]">·</span>
              <span className="text-orange">Particle UA</span>
              <span className="text-[var(--tm)]">·</span>
              <span className="text-teal">Arbitrum</span>
            </div>
          </div>
        )}

        {step === 'result' && resultStatus === 'success' && txId && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal-dim mx-auto flex items-center justify-center mb-4">
              <span className="text-teal text-2xl">✓</span>
            </div>
            <h1 className="text-[22px] font-black text-[var(--t)] mb-4">$1 sent successfully!</h1>

            <div className="bg-s1 rounded-lg p-3 mb-4 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] uppercase text-[var(--tm)]">Transaction ID</span>
                <button onClick={handleCopy} className="text-[11px] text-orange">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-[var(--t)] text-sm break-all mb-3">{truncate(txId)}</div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--ts)]">Network</span>
                <span className="text-[var(--t)]">Arbitrum One</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ts)]">Status</span>
                <span className="text-teal">{onChainHash ? 'Confirmed' : 'Relaying…'}</span>
              </div>
            </div>

            {onChainHash ? (
              <a
                href={`https://arbiscan.io/tx/${onChainHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4 text-orange text-sm underline"
              >
                View on Arbiscan
              </a>
            ) : (
              <a
                href={`https://universalx.app/activity/details?id=${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4 text-orange text-sm underline"
              >
                View on UniversalX (on-chain hash still resolving)
              </a>
            )}

            <button
              onClick={handleReset}
              className="w-full rounded-[10px] py-3 font-semibold text-[var(--ts)] bg-transparent border border-[var(--b)]"
            >
              Run test again
            </button>
          </div>
        )}

        {step === 'result' && resultStatus === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-4">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h1 className="text-[22px] font-black text-red-400 mb-4">Transaction failed</h1>
            <pre className="bg-s1 rounded-lg p-3 mb-4 text-left text-red-300 text-xs font-mono whitespace-pre-wrap break-all">
              {errorMessage}
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

      <div className="w-full max-w-[420px] mt-4 bg-s1 border border-[var(--b)] rounded-[10px] p-3.5">
        <div className="text-[11px] uppercase text-orange mb-2" style={{ letterSpacing: '0.08em' }}>
          Integration log
        </div>
        <div className="font-mono text-xs text-[var(--ts)] space-y-1 max-h-[200px] overflow-y-auto">
          {logs.length === 0 && <div>Waiting for activity…</div>}
          {logs.map((entry, i) => (
            <div key={i} className="break-all">
              <span className="text-[var(--tm)]">[{entry.time}]</span> {entry.message}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
