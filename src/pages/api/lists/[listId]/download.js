import path from 'path';
import AdmZip from 'adm-zip';
import { Duplex } from 'stream';
import NextAuth from 'next-auth/client';
import queryString from 'query-string';

import { getListById, getSessionUser } from '@helpers/database';
import { absoluteUrl, uriToId } from '@helpers/utils';
import { withRequestValidation } from '@helpers/api';
import { default as cfg } from '~/config';

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
  const session = await NextAuth.getSession({ req });
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
  for (let i = 0; i < list.items.length; i += 1) {
    const item = list.items[i];
    const route = cfg.routes[item.type];
    if (route) {
      const entity = await (
        await fetch(
          `${absoluteUrl(req)}/api/entity?${queryString.stringify({
            id: uriToId(item.uri, { base: route.uriBase }),
            type: item.type,
          })}`,
          {
            headers:
              req && req.headers
                ? {
                    cookie: req.headers.cookie,
                  }
                : undefined,
          }
        )
      ).json();

      if (entity && entity.result) {
        const { result } = entity;
        for (let j = 0; j < result.representation.length; j += 1) {
          const imageBuffer = await downloadImageAsBuffer(result.representation[j].image);
          if (imageBuffer) {
            zip.addFile(path.basename(result.representation[j].image), imageBuffer);
          }
        }

        const content = JSON.stringify(result, null, 2);
        zip.addFile(`${result.identifier}.json`, Buffer.alloc(content.length, content));
      }
    }
  }

  const willSendthis = zip.toBuffer();
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Length': willSendthis.length,
  });
  const readStream = bufferToStream(willSendthis);
  readStream.pipe(res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
