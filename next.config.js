const config = require('./config');

module.exports = {
  experimental: {
    async rewrites() {
      return Object.entries(config.routes).flatMap(([routeName, route]) => {
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
      });
    },
  },
};
