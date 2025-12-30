/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Агрессивные оптимизации для ограниченной памяти
  productionBrowserSourceMaps: false,
  swcMinify: true,
  
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      config.devtool = false;
    }
    
    config.parallelism = 1;
    
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: config.optimization.minimizer?.map((plugin) => {
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
            maxSize: 200000,
          },
        },
      };
    }
    
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1,
      maxAge: 1000 * 60 * 5,
    };
    
    return config;
  },
  
  output: 'standalone',
  compress: true,
};

export default nextConfig;
