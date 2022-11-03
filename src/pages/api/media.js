import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { url, width, height } = req.query;

  let requestUrl = url;

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

  requestUrl = `${imaginaryEndpoint}/pipeline?url=${encodeURIComponent(
    url
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
  return fetchRes.body.pipe(res);
});
