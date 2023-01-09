import { search } from '@helpers/search';
import { uriToId } from '@helpers/utils';
import { eachLimit } from 'async';
import config from '~/config';

function generateSiteMap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!--We manually set the two URLs we know already-->
    <url>
      <loc>https://jsonplaceholder.typicode.com</loc>
    </url>
    ${entries
      .map((entry) => {
        return `
    <url>
      <loc>${entry}</loc>
    </url>
  `;
      })
      .join('')}
  </urlset>`;
}

function SiteMap() {}

export async function getServerSideProps({ res, locale }) {
  const entries = [];
  await eachLimit(Object.entries(config.routes), 1, async ([routeName, route]) => {
    const query = { type: routeName };
    const session = null;
    const searchData = await search(query, session, locale, {
      overrideLimit: -1,
      computeTotalResults: false,
      fetchFavorites: false,
      fetchDetails: false,
    });

    entries.push(`${process.env.SITE}`);
    entries.push(`${process.env.SITE}/terms`);
    entries.push(`${process.env.SITE}/privacy`);
    entries.push(
      ...searchData.results.map((result) => {
        return `${process.env.SITE}/${routeName}/${encodeURI(
          uriToId(result['@id'], { base: route.uriBase })
        )}`;
      })
    );
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
