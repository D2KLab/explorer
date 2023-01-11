const path = require('path');

const config = require('./config');

module.exports = {
  i18n: {
    locales: Object.keys(config.search.languages),
    defaultLocale: Object.keys(config.search.languages)[0],
  },
  localePath: path.resolve('./public/static/locales'),
  detection: {
    order: ['cookie', 'localStorage'],
    lookupCookie: 'lang',
    lookupLocalStorage: 'lang',
    caches: ['cookie', 'localStorage'],
  },
};
