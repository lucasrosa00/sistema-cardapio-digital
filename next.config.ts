import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Otimizações para acelerar o build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Otimizar imagens
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Configurações experimentais para melhorar performance do build
  experimental: {
    // Otimizar imports de pacotes grandes
    optimizePackageImports: ['lucide-react', 'zustand'],
  },
};

export default nextConfig;
