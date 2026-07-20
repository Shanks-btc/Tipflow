'use client'
import { Magic } from 'magic-sdk'
import { EVMExtension } from '@magic-ext/evm'
import { BrowserProvider } from 'ethers'
import { ARBITRUM_CHAIN_ID, ARBITRUM_RPC } from './constants'
import type { TipSigner } from './tipSigner'

export type MagicInstance = Magic<[EVMExtension]>

// Mode B — with EVM extension, for EIP-7702 signing after login (see
// createMagicSigner below). Not used for the OTP login flow itself; see
// getMagicBare (Mode A).
let magic: MagicInstance | null = null

export function getMagic(): MagicInstance {
  if (typeof window === 'undefined') throw new Error('Magic is client-only')
  if (!magic) {
    magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {
      extensions: [
        new EVMExtension([
          {
            rpcUrl: ARBITRUM_RPC,
            chainId: ARBITRUM_CHAIN_ID,
            default: true,
          },
        ]),
      ],
    })
  }
  return magic
}

// Mode A — auth only, no EVM extension. Used for the OTP login flow
// (sendOTP/verifyOTP in useMagicAuth.ts). Kept as a separate instance from
// getMagic() (Mode B, below) rather than one instance with everything
// attached, so the auth flow never depends on EVM extension state.
// Magic's session lives in its relayer iframe keyed to the API key, not in
// this JS wrapper object, so a login performed here is visible to Mode B's
// instance too (same key, different extensions) once constructed.
let magicBare: Magic | null = null

export function getMagicBare(): Magic {
  if (typeof window === 'undefined') throw new Error('Magic is client-only')
  if (!magicBare) {
    magicBare = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!)
  }
  return magicBare
}

// Adapts a logged-in Magic instance to the TipSigner interface useParticleUA
// expects. `address` is passed in rather than fetched here because it's
// already known from the login step (magic.user.getInfo() is async and
// TipSigner.address must be synchronous).
export function createMagicSigner(magic: MagicInstance, address: string): TipSigner {
  return {
    address,
    async signMessage(bytes: Uint8Array): Promise<string> {
      const provider = new BrowserProvider(magic.rpcProvider)
      const signer = await provider.getSigner()
      return signer.signMessage(bytes)
    },
    async signAuthorization({ contractAddress, chainId, nonce }) {
      const result = await magic.wallet.sign7702Authorization({ contractAddress, chainId, nonce })
      return {
        contractAddress: result.contractAddress,
        chainId: result.chainId,
        nonce: result.nonce,
        v: result.v,
        r: result.r,
        s: result.s,
      }
    },
    async sendType4Transaction({ to, data, authorizationList }) {
      return magic.wallet.send7702Transaction({ to, data, authorizationList })
    },
  }
}
