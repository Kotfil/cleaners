import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Отключить параллельную сборку для экономии памяти
  experimental: {
    // Использовать только один worker
    workerThreads: false,
    cpus: 1,
  },
  // Ограничить количество параллельных сборок
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
};

export default nextConfig;
