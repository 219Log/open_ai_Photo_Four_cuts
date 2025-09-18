import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async rewrites() {
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
      ]
    }
    return []
  },
}

export default nextConfig
