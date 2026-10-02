import { eachLimit } from 'async';

import { dumpEntities } from '@helpers/search';
import { uriToId } from '@helpers/utils';
import config from '~/config';

function generateSiteMap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((entry) => {
    return `<url><loc>${entry}</loc></url>`;
  })
  .join('\n')}
</urlset>`;
}

function SiteMap() {}

export async function getServerSideProps({ res, locale }) {
  const entries = [
    `${process.env.SITE}`,
    `${process.env.SITE}/about`,
    `${process.env.SITE}/terms`,
    `${process.env.SITE}/privacy`,
  ];

  // Browse landing pages for public routes
  Object.entries(config.routes).forEach(([routeName, route]) => {
    if (route.showInNavbar !== false) {
      entries.push(`${process.env.SITE}/${routeName}`);
    }
  });

  // Full detail-page dump only for deployments that opt in
  if (config.sitemap?.includeEntities === true) {
    await eachLimit(Object.entries(config.routes), 1, async ([routeName, route]) => {
      const query = { type: routeName };
      const searchData = await dumpEntities(query, locale);

      searchData
        .map((result) => {
          return `${process.env.SITE}/${routeName}/${encodeURI(
            uriToId(result['@id'], { base: route.uriBase }),
          )}`;
        })
        .forEach((entry) => entries.push(entry));
    });
  }

  // Generate sitemap for search results entries
  const sitemap = generateSiteMap(entries);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
