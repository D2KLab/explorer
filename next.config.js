const config = require('./config');
const { i18n } = require('./next-i18next.config');

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  i18n,
  images: {
    domains: config.imagesDomains,
  },
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
  webpack: (cfg, context) => {
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    if (!context.isServer) {
      cfg.resolve.fallback.fs = false;
      cfg.resolve.fallback.child_process = false;
      cfg.resolve.fallback.net = false;
      cfg.resolve.fallback.tls = false;
    }

    // Required to make Fast Refresh work with Docker
    // see: https://github.com/vercel/next.js/issues/36774#issuecomment-1211818610
    cfg.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };

    // Allow importing SVG via Webpack
    cfg.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return cfg;
  },
  ...config.nextConfig,
};
