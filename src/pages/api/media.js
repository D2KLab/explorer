import { Readable } from 'node:stream';

import { withRequestValidation } from '@helpers/api';
import config from '~/config';

function sendPlaceholderImage(res) {
  const placeholder = config.search?.placeholderImage;
  if (!placeholder) {
    res.writeHead(502, { 'Cache-Control': 'no-store' });
    res.end();
    return;
  }
  res.writeHead(302, { Location: placeholder, 'Cache-Control': 'no-store' });
  res.end();
}

/**
 * A function that takes in a URL and returns a response with an optimized version of the image at that URL.
 * @param {string} url - the URL of the image to return
 */
export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { url, width, height } = req.query;

  // Check if imaginary is configured
  const imaginaryEndpoint = process.env.IMAGINARY_URL;
  if (typeof imaginaryEndpoint === 'undefined') {
    return url;
  }

  const sizeParams = {};
  if (typeof width !== 'undefined') {
    sizeParams.width = width;
  }
  if (typeof height !== 'undefined') {
    sizeParams.height = height;
  }

  const type = typeof width !== 'undefined' && typeof height !== 'undefined' ? 'enlarge' : 'resize';

  const operations = [
    {
      operation: type,
      params: sizeParams,
    },
    {
      operation: 'convert',
      params: {
        type: 'webp',
      },
    },
  ];

  const requestUrl = `${imaginaryEndpoint}/pipeline?url=${encodeURIComponent(
    url,
  )}&operations=${encodeURIComponent(JSON.stringify(operations))}`;

  let fetchRes;
  try {
    fetchRes = await fetch(requestUrl);
  } catch (error) {
    console.error('Media proxy: upstream request failed', url, error);
    return sendPlaceholderImage(res);
  }
  if (fetchRes.status >= 400) {
    console.error('Media proxy: upstream returned', fetchRes.status, url);
    return sendPlaceholderImage(res);
  }
  const headers = Object.fromEntries(fetchRes.headers.entries());
  res.writeHead(fetchRes.status, headers);
  Readable.fromWeb(fetchRes.body).pipe(res);
});
