// Magic SDK removed — production auth is now Supabase email OTP plus a
// deterministic wallet derived server-side per user (see
// lib/walletDerivation.ts and api/auth/wallet/route.ts). This file is kept
// (rather than deleted) to hold the resulting TipSigner adapter, matching
// where createMagicSigner used to live.
//
// createUserSigner is nearly identical to testWalletSigner.ts's
// createTestWalletSigner — both wrap a raw ethers.Wallet as a TipSigner —
// but are kept as separate implementations so production and the
// localhost-only dev/test signer construction stay clearly distinct call
// sites, and so Phase 2's verified test page (src/app/tip/test/page.tsx),
// which has its own independent inline copy of this same logic, is never
// affected by changes here.
import type { Wallet } from 'ethers'
import type { AuthorizationSignature, TipSigner } from './tipSigner'

export function createUserSigner(wallet: Wallet): TipSigner {
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
