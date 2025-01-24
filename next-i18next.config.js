const path = require('path');

module.exports = {
  images: {
    domains: ['d3cqeg6fl6kah.cloudfront.net'],
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['en', 'fr', 'ar'],
    localeDetection: true,
  },
  localePath: path.resolve('./public/locales'),
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
