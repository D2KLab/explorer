import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { url, width, height } = req.query;

  let requestUrl = url;

  // Check if imaginary is configured
  const imaginaryEndpoint = process.env.IMAGINARY_URL;
  if (typeof imaginaryEndpoint !== 'undefined') {
    const urlParts = [];
    if (typeof url !== 'undefined') {
      urlParts.push(`url=${encodeURIComponent(url)}`);
    }
    if (typeof width !== 'undefined') {
      urlParts.push(`width=${encodeURIComponent(width)}`);
    }
    if (typeof height !== 'undefined') {
      urlParts.push(`height=${encodeURIComponent(height)}`);
    }
    const type =
      typeof width !== 'undefined' && typeof height !== 'undefined' ? 'enlarge' : 'resize';
    requestUrl = `${imaginaryEndpoint}/${type}${
      urlParts.length > 0 ? `?${urlParts.join('&')}` : ''
    }`;
  }

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
