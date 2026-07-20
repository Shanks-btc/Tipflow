'use client'
import { useCallback, useState } from 'react'
import { getBytes } from 'ethers'
import type { IAssetsResponse, ITransaction } from '@particle-network/universal-account-sdk'
import { createUniversalAccount } from '@/lib/particle'
import { ARBITRUM_CHAIN_ID, USDC_ARBITRUM } from '@/lib/constants'
import type { TipSigner } from '@/lib/tipSigner'

type UA = ReturnType<typeof createUniversalAccount>
type ProgressFn = (message: string) => void

async function isDelegatedOnArbitrum(ua: UA): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Particle SDK's own type is Promise<any>
  const deployments: any[] = await ua.getEIP7702Deployments()
  const existing = deployments?.find((d) => d.chainId === ARBITRUM_CHAIN_ID)
  return !!existing?.isDelegated
}

// Pre-delegates the fan's EOA to a Universal Account on Arbitrum via a
// Type-4 (EIP-7702) transaction, if it isn't delegated there already. This
// happens once per user per chain — createTransferTransaction() below
// requires the account to already be delegated. Signer-agnostic: works with
// any TipSigner (Magic today, a raw test wallet for now, Privy later).
async function ensureDelegated(ua: UA, signer: TipSigner, onProgress?: ProgressFn): Promise<void> {
  onProgress?.('Checking EIP-7702 delegation status on Arbitrum…')
  if (await isDelegatedOnArbitrum(ua)) {
    onProgress?.('EIP-7702 delegation already active')
    return
  }

  onProgress?.('Not delegated yet — signing EIP-7702 authorization…')
  const [auth] = await ua.getEIP7702Auth([ARBITRUM_CHAIN_ID])
  const authorization = await signer.signAuthorization({
    contractAddress: auth.address,
    chainId: ARBITRUM_CHAIN_ID,
    nonce: auth.nonce + 1,
  })
  onProgress?.('EIP-7702 authorization signed')

  await signer.sendType4Transaction({
    to: signer.address,
    data: '0x',
    authorizationList: [authorization],
  })
  onProgress?.('EIP-7702 delegation transaction confirmed')
}

// Signs a Universal Account transaction's rootHash and submits it. Assumes
// the account is already delegated (see ensureDelegated).
async function signAndSend(ua: UA, transaction: ITransaction, signer: TipSigner, onProgress?: ProgressFn) {
  onProgress?.('Signing transaction…')
  const signature = await signer.signMessage(getBytes(transaction.rootHash))
  onProgress?.('Submitting transaction to Universal Account…')
  return ua.sendTransaction(transaction, signature)
}

export function useParticleUA() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reports current delegation status without side effects — lets the UI
  // show "Pending" / "Active" before the user commits to sending anything.
  const checkDelegation = useCallback(async (ownerAddress: string): Promise<boolean> => {
    const ua = createUniversalAccount(ownerAddress)
    return isDelegatedOnArbitrum(ua)
  }, [])

  const sendTip = useCallback(
    async ({
      signer,
      streamerUA,
      amountUsd,
      onProgress,
    }: {
      signer: TipSigner
      streamerUA: string
      amountUsd: number
      onProgress?: ProgressFn
    }): Promise<string> => {
      setLoading(true)
      setError(null)
      try {
        const ua = createUniversalAccount(signer.address)
        onProgress?.('Universal Account instance created')

        await ensureDelegated(ua, signer, onProgress)

        onProgress?.(`Building transfer transaction — $${amountUsd} USDC to ${streamerUA}`)
        const transaction = await ua.createTransferTransaction({
          token: { chainId: ARBITRUM_CHAIN_ID, address: USDC_ARBITRUM },
          amount: amountUsd.toString(),
          receiver: streamerUA,
        })

        const result = await signAndSend(ua, transaction, signer, onProgress)
        const transactionId = result.transactionId as string
        onProgress?.(`Transaction submitted — ID: ${transactionId}`)
        return transactionId
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send tip'
        setError(message)
        onProgress?.(`Error: ${message}`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Polls Particle for the settled transaction so callers can surface a
  // real on-chain hash once one is available (immediately after sendTip()
  // resolves, the transaction may still be relaying).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Particle SDK's own type is Promise<any>
  const getTransactionDetails = useCallback(async (ownerAddress: string, transactionId: string): Promise<any> => {
    const ua = createUniversalAccount(ownerAddress)
    return ua.getTransaction(transactionId)
  }, [])

  const getBalance = useCallback(async (ownerAddress: string): Promise<IAssetsResponse> => {
    const ua = createUniversalAccount(ownerAddress)
    return ua.getPrimaryAssets()
  }, [])

  // Streamer-side withdrawal — same transfer primitive as sendTip (an
  // EIP-7702 owner EOA and its Universal Account are the same address, so
  // this is just createTransferTransaction() with an arbitrary receiver
  // instead of a fixed streamer UA). Kept separate from sendTip rather than
  // sharing a helper so the already-mainnet-verified fan tip path is never
  // touched by dashboard work.
  const withdraw = useCallback(
    async ({
      signer,
      toAddress,
      amountUsd,
      onProgress,
    }: {
      signer: TipSigner
      toAddress: string
      amountUsd: number
      onProgress?: ProgressFn
    }): Promise<string> => {
      setLoading(true)
      setError(null)
      try {
        const ua = createUniversalAccount(signer.address)
        onProgress?.('Universal Account instance created')

        await ensureDelegated(ua, signer, onProgress)

        onProgress?.(`Building withdrawal transaction — $${amountUsd} USDC to ${toAddress}`)
        const transaction = await ua.createTransferTransaction({
          token: { chainId: ARBITRUM_CHAIN_ID, address: USDC_ARBITRUM },
          amount: amountUsd.toString(),
          receiver: toAddress,
        })

        const result = await signAndSend(ua, transaction, signer, onProgress)
        const transactionId = result.transactionId as string
        onProgress?.(`Withdrawal submitted — ID: ${transactionId}`)
        return transactionId
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to withdraw'
        setError(message)
        onProgress?.(`Error: ${message}`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { sendTip, withdraw, getBalance, getTransactionDetails, checkDelegation, loading, error }
}
