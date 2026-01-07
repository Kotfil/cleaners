import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ИСПРАВЛЕНИЕ: Используем уникальные имена переменных, чтобы избежать конфликта
// с системными переменными __filename и __dirname, которые уже существуют при сборке.
const configFilename = fileURLToPath(import.meta.url);
const configDirname = dirname(configFilename);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Агрессивные оптимизации для ограниченной памяти
  productionBrowserSourceMaps: false,

  experimental: {
    workerThreads: false,
    cpus: 1, // Только один CPU
    optimizePackageImports: [],
  },

  output: 'standalone',
  compress: false,

  images: {
    unoptimized: true,
  },

  // Оптимизация webpack для экономии памяти
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      config.devtool = false;
    }

    config.parallelism = 1;

    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1,
      maxAge: 1000 * 60 * 5,
      compression: 'gzip',
      buildDependencies: {
        // ВАЖНО: Тут используем нашу переименованную переменную
        config: [configFilename],
      },
    };

    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: config.optimization.minimizer?.map((plugin: any) => {
          if (plugin.constructor.name === 'TerserPlugin') {
            return {
              ...plugin,
              options: {
                ...plugin.options,
                parallel: false,
                terserOptions: {
                  ...plugin.options?.terserOptions,
                  compress: {
                    ...plugin.options?.terserOptions?.compress,
                    passes: 1,
                    drop_console: false,
                  },
                },
              },
            };
          }
          return plugin;
        }),
      };

      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 150000,
            minSize: 10000,
          },
        },
      };
    }

    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };

    return config;
  },
};

export default nextConfig;