/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.mapbox.com' },
      { protocol: 'https', hostname: 'assets.devfolio.co' },
    ],
  },

  // Helpful redirects
  async redirects() {
    return [
      { source: '/app',    destination: '/dashboard',   permanent: false },
      { source: '/login',  destination: '/auth/signin', permanent: true },
      { source: '/signup', destination: '/auth/signin', permanent: true },
      { source: '/submit', destination: '/pitch',        permanent: false },
    ]
  },

  // Only add security headers in production
  async headers() {
    if (process.env.NODE_ENV !== 'production') return []
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
