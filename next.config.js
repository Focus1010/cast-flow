module.exports = {
  reactStrictMode: false, // Disable strict mode for frame compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; connect-src 'self' https: wss: https://*.walletconnect.com https://*.mypinata.cloud https://*.decentralized-content.com https://*.quicknode.com https://*.pinata.cloud https://ipfs.io https://imagedelivery.net https://turquoise-blank-swallow-685.mypinata.cloud https://gateway.pinata.cloud https://explorer-api.walletconnect.com; frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://warpcast.com;",
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
};