// Abstracts "can sign an EIP-7702 authorization, sign a message, and
// broadcast a type-4 transaction" so useParticleUA's sendTip() can work
// with Magic's wallet module, a raw local test wallet, or (later) Privy —
// without the Particle Universal Account transaction logic in
// useParticleUA.ts ever needing to know which one it's talking to.
export interface AuthorizationSignature {
  contractAddress: string
  chainId: number
  nonce: number
  v: number
  r: string
  s: string
}

export interface TipSigner {
  address: string
  signMessage(bytes: Uint8Array): Promise<string>
  signAuthorization(params: { contractAddress: string; chainId: number; nonce: number }): Promise<AuthorizationSignature>
  sendType4Transaction(params: {
    to: string
    data: string
    authorizationList: AuthorizationSignature[]
  }): Promise<{ transactionHash: string }>
}
