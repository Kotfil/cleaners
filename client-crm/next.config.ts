import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Агрессивные оптимизации для ограниченной памяти
  productionBrowserSourceMaps: false, // Отключить source maps
  
  experimental: {
    workerThreads: false,
    cpus: 1, // Только один CPU
    // Отключить оптимизацию изображений во время сборки
    optimizePackageImports: [],
  },
  
  // Отключить генерацию статических страниц во время сборки
  generateStaticParams: false,
  
  // Оптимизация webpack для экономии памяти
  webpack: (config, { isServer, dev }) => {
    // Отключить source maps в production
    if (!dev) {
      config.devtool = false;
    }
    
    // Ограничить параллелизм
    config.parallelism = 1;
    
    // Уменьшить размер кэша в памяти
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1,
      maxAge: 1000 * 60 * 5, // 5 минут
      compression: 'gzip',
      buildDependencies: {
        config: [__filename],
      },
    };
    
    // Оптимизация для клиентской сборки
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
                parallel: false, // Отключить параллельную минификацию
                terserOptions: {
                  ...plugin.options?.terserOptions,
                  compress: {
                    ...plugin.options?.terserOptions?.compress,
                    passes: 1, // Уменьшить количество проходов
                    drop_console: false, // Не удалять console для экономии памяти
                  },
                },
              },
            };
          }
          return plugin;
        }),
      };
      
      // Ограничить размер чанков
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
            maxSize: 150000, // Уменьшить размер чанков
            minSize: 10000,
          },
        },
      };
    }
    
    // Ограничить размер модулей в памяти
    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
    
    return config;
  },
  
  // Отключить генерацию статических страниц во время сборки
  output: 'standalone',
  
  // Отключить компрессию во время сборки (можно включить на сервере)
  compress: false,
  
  // Отключить оптимизацию изображений
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
