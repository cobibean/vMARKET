import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Ignore the docs directory during build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/docs/**', '**/node_modules']
    };
    return config;
  },
  // Exclude docs from page compilation
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']
};

export default nextConfig;
