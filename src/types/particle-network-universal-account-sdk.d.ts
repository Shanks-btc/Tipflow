// @particle-network/universal-account-sdk@1.1.1 ships a valid dist/index.d.ts, but its
// package.json "exports" map only declares "import"/"require" conditions — no "types"
// condition. Under moduleResolution "bundler" (Next.js's default) TS resolves types
// strictly through "exports" and can't find the declarations, even though the runtime
// import/require resolution is unaffected. Named re-exports below forward the real
// types without touching runtime module resolution.
// (Note: `export * from '<relative path>'` here silently re-exports nothing — only
// explicit named re-exports work inside an ambient `declare module` block.)
declare module '@particle-network/universal-account-sdk' {
  export {
    UniversalAccount,
    UNIVERSAL_ACCOUNT_VERSION,
    CHAIN_ID,
    SUPPORTED_TOKEN_TYPE,
    type IUniversalAccountConfig,
    type ITransaction,
    type ITransferTransaction,
    type IBasicToken,
    type IAssetsResponse,
    type IAsset,
    type EIP7702Authorization,
  } from '../../node_modules/@particle-network/universal-account-sdk/dist/index'
}
