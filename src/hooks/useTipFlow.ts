'use client'
import { useCallback, useState } from 'react'
import { useMagicAuth } from './useMagicAuth'
import { useParticleUA } from './useParticleUA'

export type TipFlowState = 'select' | 'email' | 'otp' | 'sending' | 'success' | 'error'

export function useTipFlow(streamerUA: string) {
  const magicAuth = useMagicAuth()
  const particleUA = useParticleUA()

  const [state, setState] = useState<TipFlowState>('select')
  const [amount, setAmount] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [fanAddress, setFanAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectAmount = useCallback((n: number) => {
    setAmount(n)
    setState('email')
  }, [])

  const submitEmail = useCallback(async () => {
    if (!email) return
    setError(null)
    try {
      await magicAuth.sendOTP(email)
      setState('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send the login code')
      setState('error')
    }
  }, [email, magicAuth])

  const submitOTP = useCallback(
    async (otp: string) => {
      setError(null)
      try {
        const address = await magicAuth.verifyOTP(email, otp)
        setFanAddress(address)
        setState('sending')

        if (!amount) throw new Error('No tip amount selected')
        const hash = await particleUA.sendTip({
          signer: magicAuth.getSigner(),
          streamerUA,
          amountUsd: amount,
        })
        setTxHash(hash)
        setState('success')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send tip')
        setState('error')
      }
    },
    [amount, email, magicAuth, particleUA, streamerUA]
  )

  const executeTip = useCallback(async () => {
    if (!fanAddress || !amount) {
      setError('Missing fan address or amount')
      setState('error')
      return
    }
    setError(null)
    setState('sending')
    try {
      const hash = await particleUA.sendTip({
        signer: magicAuth.getSigner(),
        streamerUA,
        amountUsd: amount,
      })
      setTxHash(hash)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip')
      setState('error')
    }
  }, [amount, fanAddress, magicAuth, particleUA, streamerUA])

  const reset = useCallback(() => {
    setState('select')
    setAmount(null)
    setMessage('')
    setEmail('')
    setFanAddress(null)
    setTxHash(null)
    setError(null)
  }, [])

  return {
    state,
    amount,
    message,
    email,
    fanAddress,
    txHash,
    error,
    loading: magicAuth.loading || particleUA.loading,
    setMessage,
    setEmail,
    selectAmount,
    submitEmail,
    submitOTP,
    executeTip,
    reset,
  }
}
