import path from 'path';
import AdmZip from 'adm-zip';
import { Duplex } from 'stream';
import json2csv from 'json2csv';
import json2md from 'json2md';
import { i18n } from 'next-i18next';

import { getListById, getSessionUser } from '@helpers/database';
import { uriToId, slugify } from '@helpers/utils';
import { getEntityMainLabel } from '@helpers/explorer';
import { withRequestValidation } from '@helpers/api';
import { default as cfg } from '~/config';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getEntity } from '@pages/api/entity';

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
      const result = await getEntity(
        {
          id: uriToId(item.uri, { base: route.uriBase }),
          type: item.type,
          hl: req.query.hl,
        },
        req.query.hl
      );

      if (result) {
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
          Buffer.from(csv, 'utf8')
        );

        // Add JSON metadata to the Zip
        const jsonContent = JSON.stringify(result, null, 2);
        zip.addFile(
          path.join(listFolder, resultBaseName, `${resultBaseName}.json`),
          Buffer.from(jsonContent, 'utf8')
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
          Buffer.from(markdownItemText, 'utf8')
        );

        // Push the markdown item to the list of all markdown results
        markdownResults.push(...markdownItem);
      }
    }
  }

  // Add all items to a single JSON file
  const contentResults = JSON.stringify(results, null, 2);
  zip.addFile(path.join(listFolder, 'items.json'), Buffer.from(contentResults, 'utf8'));

  // Add all items to a single CSV file
  const csvResults = json2csv.parse(flatResults, {
    fields: Array.from(flatResultsKeys),
    header: true,
  });
  zip.addFile(path.join(listFolder, 'items.csv'), Buffer.from(csvResults, 'utf8'));

  // Add all items to a single Markdown file
  const markdownResultsText = json2md(markdownResults);
  zip.addFile(path.join(listFolder, 'README.md'), Buffer.from(markdownResultsText, 'utf8'));

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
