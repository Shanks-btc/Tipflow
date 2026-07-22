/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shakes barrel-file imports so only the specific named exports
    // actually used end up in the client bundle, instead of the whole
    // package.
    optimizePackageImports: ['@particle-network/universal-account-sdk'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/websocket-server/**'],
    };
    return config;
  },
  // /login is a fully 'use client' page with no server data dependency, so
  // Next.js treats it as static — `export const dynamic = 'force-dynamic'`
  // in the page file itself is documented to override that, but wasn't
  // actually honored by this Next 14.2.35 build (confirmed via
  // .next/prerender-manifest.json: initialRevalidateSeconds stayed
  // `false`, meaning still fully static, even with that export present).
  // Overriding Cache-Control here works regardless of that, since it
  // controls the actual HTTP response header sent to the edge/CDN layer
  // directly. Without this, a static page can be cached at the edge
  // (Railway) for up to a year (`s-maxage=31536000` was observed in
  // production) — independent of any visiting device's own cache, so a
  // stale snapshot from an old deploy can keep being served to new
  // visitors long after the underlying bug is fixed.
  async headers() {
    return [
      {
        source: '/login',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
