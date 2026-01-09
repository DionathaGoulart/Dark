import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compressão e otimização
  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
    // Formatos modernos
    formats: ['image/avif', 'image/webp'],
    // Minimiza tamanho de imagens
    minimumCacheTTL: 31536000, // 1 ano
    qualities: [25, 50, 75, 85, 90],
  },

  experimental: {
    // Tree-shaking otimizado para pacotes grandes
    optimizePackageImports: ['lucide-react'],
  },

  // Headers de cache para assets estáticos
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig

