const path = require('path');

module.exports = {
  i18n: {
    locales: ['en', 'fr', 'ar'], // Langues supportées
    defaultLocale: 'fr', // Langue par défaut
    localeDetection: true, // Détection automatique
  },
  localePath: path.resolve('./public/locales'),
};
