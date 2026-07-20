/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shakes barrel-file imports so only the specific named exports
    // actually used end up in the client bundle, instead of the whole
    // package.
    optimizePackageImports: ['@particle-network/universal-account-sdk'],
  },
};

export default nextConfig;
