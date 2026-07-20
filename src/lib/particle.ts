import { UniversalAccount, UNIVERSAL_ACCOUNT_VERSION } from '@particle-network/universal-account-sdk'

export function createUniversalAccount(ownerAddress: string): UniversalAccount {
  return new UniversalAccount({
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
    projectClientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
    projectAppUuid: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
    smartAccountOptions: {
      name: 'UNIVERSAL',
      version: UNIVERSAL_ACCOUNT_VERSION,
      ownerAddress,
      useEIP7702: true,
    },
    tradeConfig: {
      universalGas: true,
    },
  })
}
