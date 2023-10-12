import { Readable } from 'node:stream';

import { withRequestValidation } from '@helpers/api';

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

  // Fetch and return image
  const fetchRes = await fetch(requestUrl);
  const headers = Object.fromEntries(fetchRes.headers.entries());
  if (fetchRes.status >= 400) {
    // Do not write cache headers if there is an error
    delete headers['cache-control'];
    delete headers.expires;
  }
  res.writeHead(fetchRes.status, headers);
  Readable.fromWeb(fetchRes.body).pipe(res);
});
