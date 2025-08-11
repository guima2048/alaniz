import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['@supabase/supabase-js'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
      // Otimizar CSS para produção
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    return config;
  },
};

export default nextConfig;
