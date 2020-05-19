const NextI18Next = require('next-i18next').default;

const config = require('./config');

module.exports = new NextI18Next({
  defaultLanguage: config.search.defaultLanguage,
  otherLanguages: Object.keys(config.search.languages).filter(
    (l) => l !== config.search.defaultLanguage
  ),
  localeSubpaths: Object.keys(config.search.languages).reduce((langs, l) => {
    langs[l] = l;
    return langs;
  }, {}),
  detection: {
    order: ['cookie', 'localStorage'],
    lookupCookie: 'lang',
    lookupLocalStorage: 'lang',
    caches: ['cookie', 'localStorage'],
  },
});
