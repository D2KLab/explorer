/**
 * Gets the last part of an URI
 * Example:
 *  uriToId('http://dbpedia.org/page/Tim_Berners-Lee', { base: 'http://dbpedia.org/page' }) returns 'Tim_Berners-Lee'
 */
export function uriToId(uriPart, { base }) {
  const id = typeof base !== 'undefined' ? uriPart.substr(base.length + 1) : uriPart;
  return id;
}

/**
 * Converts an ID back to an URI, given a base
 * Example:
 *  idToUri('Tim_Berners-Lee', { base: 'http://dbpedia.org/page' }) returns 'http://dbpedia.org/page/Tim_Berners-Lee'
 */
export function idToUri(id, { base }) {
  const uri = typeof base !== 'undefined' ? `${base}/${id}` : id;
  return uri;
}

export function generateMediaUrl(url, width, height) {
  if (typeof url !== 'string') {
    return null;
  }

  const urlParts = [`url=${encodeURIComponent(url)}`];
  if (typeof width === 'number') {
    urlParts.push(`width=${encodeURIComponent(width)}`);
  }
  if (typeof height === 'number') {
    urlParts.push(`height=${encodeURIComponent(height)}`);
  } else {
    urlParts.push(`height=${encodeURIComponent(width)}`);
  }

  return `/api/media${urlParts.length > 0 ? `?${urlParts.join('&')}` : ''}`;
}

export function absoluteUrl(req, localhostAddress = 'localhost:3000') {
  let host = '';
  if (typeof window !== 'undefined' && window.location) {
    host = window.location.host;
  } else if (req && req.headers) {
    host = req.headers.host;
  } else {
    host = localhostAddress;
  }
  let protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:';

  if (
    req &&
    req.headers['x-forwarded-host'] &&
    typeof req.headers['x-forwarded-host'] === 'string'
  ) {
    host = req.headers['x-forwarded-host'];
  }

  if (
    req &&
    req.headers['x-forwarded-proto'] &&
    typeof req.headers['x-forwarded-proto'] === 'string'
  ) {
    protocol = `${req.headers['x-forwarded-proto']}:`;
  }

  return `${protocol}//${host}`;
}

export function removeEmptyObjects(obj) {
  Object.keys(obj).forEach((k) => {
    if (Array.isArray(obj[k])) {
      obj[k] = obj[k].filter((v) => typeof v !== 'object' || Object.keys(v).length > 0);
    }
  });
  return obj;
}

export function getQueryObject(query, options = { language: 'en' }) {
  if (typeof query === 'function') {
    return { ...query(options) };
  }
  return { ...query };
}
