import path from 'path';
import AdmZip from 'adm-zip';
import { Duplex } from 'stream';
import queryString from 'query-string';
import json2csv from 'json2csv';
import json2md from 'json2md';
import { i18n } from 'next-i18next';

import { getListById, getSessionUser } from '@helpers/database';
import { absoluteUrl, uriToId, slugify } from '@helpers/utils';
import { findRouteByRDFType, getEntityMainLabel } from '@helpers/explorer';
import { withRequestValidation } from '@helpers/api';
import { default as cfg } from '~/config';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '@pages/api/auth/[...nextauth]';

const bufferToStream = (buffer) => {
  const stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const downloadImageAsBuffer = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
};

const flattenObject = (obj) => {
  const flattenKeys = {};
  for (const i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] === 'object') {
      const flatObject = flattenObject(obj[i]);
      for (const j in flatObject) {
        if (!flatObject.hasOwnProperty(j)) continue;
        flattenKeys[`${i}.${j}`] = flatObject[j];
      }
    } else {
      flattenKeys[i] = obj[i];
    }
  }
  return flattenKeys;
};

function generateMarkdownValue(
  currentRouteName,
  currentRoute,
  metadata,
  metaName,
  metaIndex,
  meta,
  req
) {
  // Ignore empty meta objects
  if (typeof meta === 'object' && Object.keys(meta).length === 0) {
    return undefined;
  }

  let url = null;
  let printableValue = '<unk>';

  if (typeof meta === 'object') {
    const [routeName, route] = findRouteByRDFType(meta['@type']);
    const filter =
      currentRoute &&
      Array.isArray(currentRoute.filters) &&
      currentRoute.filters.find((f) => f.id === metaName);

    const metaId = meta['@id'];
    if (route) {
      url = `${absoluteUrl(req)}/${routeName}/${encodeURI(
        uriToId(metaId, { base: route.uriBase })
      )}`;
    } else if (filter) {
      url = `${absoluteUrl(req)}/${currentRouteName}?filter_${metaName}=${encodeURIComponent(
        metaId
      )}`;
    }

    if (Array.isArray(meta.label)) {
      printableValue = meta.label.join(', ');
    } else if (typeof meta.label === 'object') {
      // If $langTag is set to 'show' in sparql-transformer
      printableValue = meta.label['@value'];
    } else if (typeof meta.label === 'string') {
      // Example: {"@id":"http://data.silknow.org/collection/ec0f9a6f-7b69-31c4-80a6-c0a9cde663a5","@type":"http://erlangen-crm.org/current/E78_Collection","label":"European Sculpture and Decorative Arts"}
      printableValue = meta.label;
    } else {
      printableValue = metaId;
      url = null;
    }
  } else {
    printableValue = meta;
    if (['http://', 'https://'].some((protocol) => meta.startsWith(protocol))) {
      url = meta;
    }
  }

  if (currentRoute.metadata && typeof currentRoute.metadata[metaName] === 'function') {
    printableValue = currentRoute.metadata[metaName](printableValue, metaIndex, metadata);
  }

  if (!url && !printableValue) {
    return undefined;
  }

  if (!url) {
    return printableValue;
  }

  return json2md({
    link: {
      title: printableValue,
      source: url,
    },
  });
}

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  i18n?.init({ lng: req.query.hl });

  const list = await getListById(req.query.listId);

  if (!list) {
    res.status(404).json({
      error: {
        status: 404,
        message: 'List not found',
      },
    });
    return;
  }

  // Get user informations
  const session = await unstable_getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);

  const isOwner = user && list && list.user.equals(user._id);

  if (req.method === 'GET') {
    if (!list.is_public && !isOwner) {
      res.status(403).json({
        error: {
          status: 403,
          message: 'Forbidden',
        },
      });
      return;
    }
  }

  const zip = new AdmZip();
  const listFolder = slugify(list.name);
  const results = [];
  const flatResults = [];
  const flatResultsKeys = new Set();
  const markdownResults = [
    {
      h1: list.name,
    },
  ];

  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const route = cfg.routes[item.type];
    if (route) {
      const entity = await (
        await fetch(
          `${absoluteUrl(req)}/api/entity?${queryString.stringify({
            id: uriToId(item.uri, { base: route.uriBase }),
            type: item.type,
            hl: req.query.hl,
          })}`,
          {
            headers: req.headers,
          }
        )
      ).json();

      if (entity && entity.result) {
        const { result } = entity;
        const resultLabel = getEntityMainLabel(result, { route, language: req.query.hl });
        const resultBaseName = [
          resultLabel?.replace(/\//, '-'),
          uriToId(result['@id'], {
            base: route.uriBase,
          }),
        ]
          .filter((x) => x)
          .join('-');

        results.push(result);

        // Add images to the Zip
        const imagesToDownload = []
          .concat(result.representation, result.image)
          .filter((x) => x)
          .map((x) => x.image || x);
        for (let j = 0; j < imagesToDownload.length; j += 1) {
          const imageBuffer = await downloadImageAsBuffer(imagesToDownload[j]);
          if (imageBuffer) {
            zip.addFile(
              path.join(listFolder, resultBaseName, path.basename(imagesToDownload[j])),
              imageBuffer
            );
          }
        }

        // Add CSV metadata to the Zip
        const flatResult = flattenObject(result);
        Object.keys(flatResult).forEach((key) => flatResultsKeys.add(key));
        flatResults.push(flatResult);
        const csv = json2csv.parse(flatResult, { header: true, fields: Object.keys(flatResult) });
        zip.addFile(
          path.join(listFolder, resultBaseName, `${resultBaseName}.csv`),
          Buffer.alloc(csv.length, csv)
        );

        // Add JSON metadata to the Zip
        const jsonContent = JSON.stringify(result, null, 2);
        zip.addFile(
          path.join(listFolder, resultBaseName, `${resultBaseName}.json`),
          Buffer.alloc(jsonContent.length, jsonContent)
        );

        // Construct the markdown results for this entity
        const markdownItem = [];
        markdownItem.push({ h2: resultLabel || '<no label>' });
        markdownItem.push({ h3: 'Metadata' });
        const markdownFlatResult = flattenObject(result);
        const markdownFlatResultKeys = new Set();
        Object.keys(markdownFlatResult).forEach((key) => markdownFlatResultKeys.add(key));
        markdownItem.push({
          table: { headers: ['Property', 'Value'], rows: Object.entries(markdownFlatResult) },
        });
        if (imagesToDownload.length > 0) {
          markdownItem.push({ h3: 'Images' });
          imagesToDownload.forEach((image) => {
            markdownItem.push({
              img: [{ source: image }],
            });
          });
        }

        // Add Markdown metadata to the Zip
        const markdownItemText = json2md(markdownItem);
        zip.addFile(
          path.join(listFolder, resultBaseName, `${resultBaseName}.md`),
          Buffer.alloc(markdownItemText.length, markdownItemText)
        );

        // Push the markdown item to the list of all markdown results
        markdownResults.push(...markdownItem);
      }
    }
  }

  // Add all items to a single JSON file
  const contentResults = JSON.stringify(results, null, 2);
  zip.addFile(
    path.join(listFolder, 'items.json'),
    Buffer.alloc(contentResults.length, contentResults)
  );

  // Add all items to a single CSV file
  const csvResults = json2csv.parse(flatResults, {
    fields: Array.from(flatResultsKeys),
    header: true,
  });
  zip.addFile(path.join(listFolder, 'items.csv'), Buffer.alloc(csvResults.length, csvResults));

  // Add all items to a single Markdown file
  const markdownResultsText = json2md(markdownResults);
  zip.addFile(
    path.join(listFolder, 'README.md'),
    Buffer.alloc(markdownResultsText.length, markdownResultsText)
  );

  const willSendthis = zip.toBuffer();
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Length': willSendthis.length,
    'Content-Disposition': `attachment; filename=${JSON.stringify(`${listFolder}.zip`)}`,
  });
  const readStream = bufferToStream(willSendthis);
  readStream.pipe(res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
