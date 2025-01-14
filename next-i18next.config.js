import path from 'path';

export default {
  images: {
    domains: ['d3cqeg6fl6kah.cloudfront.net'],
  },
  i18n: {
    locales: ['en', 'fr', 'ar'], // Langues supportées
    defaultLocale: 'fr', // Langue par défaut
    localeDetection: true, // Détection automatique
  },
  localePath: path.resolve('./public/locales'),
};
