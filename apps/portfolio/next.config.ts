import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Configuração para otimização de assets
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig

