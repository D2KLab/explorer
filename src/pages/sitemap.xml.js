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
    `${process.env.SITE}/terms`,
    `${process.env.SITE}/privacy`,
  ];

  await eachLimit(Object.entries(config.routes), 1, async ([routeName, route]) => {
    const query = { type: routeName };
    const searchData = await dumpEntities(query, locale);

    searchData
      .map((result) => {
        return `${process.env.SITE}/${routeName}/${encodeURI(
          uriToId(result['@id'], { base: route.uriBase })
        )}`;
      })
      .forEach((entry) => entries.push(entry));
  });

  // Generate sitemap for search results entries
  const sitemap = generateSiteMap(entries);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
