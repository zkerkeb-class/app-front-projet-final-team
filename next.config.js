const nextI18NextConfig = require('./next-i18next.config.js');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactiver PWA en développement
});

const { i18n } = require('./next-i18next.config');


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Mode strict de React
  swcMinify: true, // Utiliser SWC pour minifier
  ...nextI18NextConfig, // Importer la configuration i18n depuis next-i18next.config.js
};

module.exports = withPWA(nextConfig);
