// @ts-nocheck
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['@supabase/supabase-js'],
  // Definidas em tempo de execução pelo Vercel; tipagem Node em dev pode não estar instalada
  // portanto evitamos referenciar process.env diretamente com tipos.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: (process as any).env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: (process as any).env.NEXT_PUBLIC_BASE_URL,
  },
  async rewrites() {
    // URL limpa: /:slug → /slug/:slug (exclui rotas reservadas)
    return [
      {
        source:
          '/:slug((?!api|admin|blog|categorias|contato|legais|robots\\.txt|sitemap\\.xml|_next|favicon\\.ico).+)',
        destination: '/slug/:slug',
      },
    ];
  },
  // Otimizações de performance
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // Configurações de compressão
  compress: true,
  // Otimizações de CSS
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Otimizações para produção
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true,
        },
      };
    }
    return config;
  },
  // Headers para otimização de cache
  async headers() {
    return [
      {
        source: '/non-critical.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
