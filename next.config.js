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