const { nextI18NextRewrites } = require('next-i18next/rewrites');

const config = require('./config');

const localeSubpaths = Object.keys(config.search.languages).reduce((langs, l) => {
  langs[l] = l;
  return langs;
}, {});

module.exports = {
  publicRuntimeConfig: {
    localeSubpaths,
  },
  experimental: {
    async rewrites() {
      return [
        ...nextI18NextRewrites(localeSubpaths),
        ...Object.entries(config.routes).flatMap(([routeName, route]) => {
          const rewrites = [
            {
              source: `/${routeName}{/}?`,
              destination: `/${route.view}?type=${routeName}`,
            },
          ];
          if (route.details) {
            rewrites.push({
              source: `/${routeName}/:id`,
              destination: `/details/${route.details.view}?id=:id&type=${routeName}`,
            });
          }
          return rewrites;
        }),
      ];
    },
  },
};
