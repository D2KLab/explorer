import path from 'path';
import AdmZip from 'adm-zip';
import { Duplex } from 'stream';
import queryString from 'query-string';
import json2csv from 'json2csv';

import { getListById, getSessionUser } from '@helpers/database';
import { absoluteUrl, uriToId, slugify } from '@helpers/utils';
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

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
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
        const resultFolder = `${result.label.replace(/\//, '-')}-${uriToId(result['@id'], {
          base: route.uriBase,
        })}`;

        results.push(result);

        // Add representations to the Zip
        if (result.representation) {
          for (let j = 0; j < result.representation.length; j += 1) {
            const imageBuffer = await downloadImageAsBuffer(result.representation[j].image);
            if (imageBuffer) {
              zip.addFile(
                path.join(listFolder, resultFolder, path.basename(result.representation[j].image)),
                imageBuffer
              );
            }
          }
        }

        // Add images to the Zip
        if (result.image) {
          for (let j = 0; j < result.image.length; j += 1) {
            const imageBuffer = await downloadImageAsBuffer(result.image[j]);
            if (imageBuffer) {
              zip.addFile(
                path.join(listFolder, resultFolder, path.basename(result.image[j])),
                imageBuffer
              );
            }
          }
        }

        // Add CSV metadata to the Zip
        const flatResult = flattenObject(result);
        Object.keys(flatResult).forEach((key) => flatResultsKeys.add(key));
        flatResults.push(flatResult);
        const csv = json2csv.parse(flatResult, { header: true, fields: Object.keys(flatResult) });
        zip.addFile(
          path.join(listFolder, resultFolder, `${result.identifier}.csv`),
          Buffer.alloc(csv.length, csv)
        );

        // Add JSON metadata to the Zip
        const content = JSON.stringify(result, null, 2);
        zip.addFile(
          path.join(listFolder, resultFolder, `${result.identifier}.json`),
          Buffer.alloc(content.length, content)
        );
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
