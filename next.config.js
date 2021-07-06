const { i18n } = require('./next-i18next.config');
const config = require('./config');

module.exports = {
  i18n,
  rewrites: async () => [
      ...Object.entries(config.routes).flatMap(([routeName, route]) => {
        const rewrites = [
          {
            source: `/${routeName}{/}?`,
            destination: `/${route.view}?type=${routeName}`,
          },
        ];
        if (route.details) {
          rewrites.push({
            source: `/${routeName}/:id*`,
            destination: `/details/${route.details.view}?id=:id*&type=${routeName}`,
          });
        }
        return rewrites;
      }),
    ],
};
