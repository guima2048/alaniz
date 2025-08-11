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
  // Otimizações de CSS e JavaScript
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Otimizar CSS para produção
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
      
      // Otimizar JavaScript para navegadores modernos
      config.target = ['web', 'es2020'];
      
      // Remover polyfills desnecessários
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Remover polyfills que já existem em navegadores modernos
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
