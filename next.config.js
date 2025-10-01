module.exports = {
  turbopack: {
    root: '/vercel/path0' // Or your absolute project path, but Vercel handles this
  },
  reactStrictMode: true,
};

module.exports = {
  // ... other config
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds (use cautiously)
  },
};

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval';",
          },
        ],
      },
    ]
  },
};