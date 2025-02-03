const nextI18NextConfig = require('./next-i18next.config.js');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactiver PWA en développement
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/d3cqeg6fl6kah\.cloudfront\.net\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Mode strict de React
  swcMinify: true, // Utiliser SWC pour minifier
  ...nextI18NextConfig, // Importer la configuration i18n depuis next-i18next.config.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3cqeg6fl6kah.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 86400,
    formats: ['image/webp'],
  },
  // Optimisations de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    scrollRestoration: true,
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = withPWA(nextConfig);
