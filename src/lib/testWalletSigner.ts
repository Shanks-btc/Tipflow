// TEMPORARY, dev-only. Wraps a locally-generated ethers wallet as a
// TipSigner so the real /tip/[username] flow can be exercised end to end
// while the Magic API key issue is fixed separately. Mirrors the identical
// adapter already proven working in src/app/tip/test/page.tsx (Phase 2) —
// kept as a separate copy here rather than a shared import so Phase 2's
// verified test page is never touched by this.
import { JsonRpcProvider, Wallet } from 'ethers'
import { ARBITRUM_RPC } from './constants'
import type { AuthorizationSignature, TipSigner } from './tipSigner'

const STORAGE_KEY_PRIVATE = 'tipflow_dev_wallet_key'
const STORAGE_KEY_ADDRESS = 'tipflow_dev_wallet_address'

// Gate for the real /tip/[username] page's local-test-wallet mode
// (TipCard.tsx): true only on localhost/127.0.0.1, so the no-OTP,
// anyone-can-sign-anything test path can never be reached on the real
// deployed site (tipflow.xyz), regardless of what a client sends.
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

// Persists the fallback wallet in localStorage so it's the SAME wallet
// across page reloads and "Try again" clicks — fund it once, keep reusing
// it, until clearPersistedTestWallet() is called explicitly. Callers gate
// this with isLocalhost() before ever calling it, so localStorage never
// gets touched off localhost.
export function getOrCreatePersistedTestWallet(): Wallet {
  const provider = new JsonRpcProvider(ARBITRUM_RPC)
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PRIVATE) : null
  if (savedKey) {
    return new Wallet(savedKey, provider)
  }

  const randomKey = Wallet.createRandom().privateKey
  const wallet = new Wallet(randomKey, provider)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PRIVATE, wallet.privateKey)
    localStorage.setItem(STORAGE_KEY_ADDRESS, wallet.address)
  }
  return wallet
}

// Only ever called from an explicit user action (a "Clear wallet" button)
// — never automatically.
export function clearPersistedTestWallet(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY_PRIVATE)
  localStorage.removeItem(STORAGE_KEY_ADDRESS)
}

export function createTestWalletSigner(wallet: Wallet): TipSigner {
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
