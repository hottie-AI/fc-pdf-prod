/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],
  webpack: (config, { isServer }) => {
    // Override the exports field resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@splinetool/react-spline$': path.resolve(__dirname, 'node_modules/@splinetool/react-spline/dist/react-spline.js'),
    };

    // Ignore the package.json exports field
    config.resolve.exportsFields = [];

    return config;
  },
}

module.exports = nextConfig
