import { Base64 } from 'js-base64';

/**
 * Gets the last part of an URI
 * Example:
 *  uriToId('http://dbpedia.org/page/Tim_Berners-Lee') returns 'Tim_Berners-Lee'
 */
export function uriToId(uri, { encoding } = {}) {
  return encoding === true ? Base64.encode(uri) : uri.substr(uri.lastIndexOf('/') + 1);
}

/**
 * Converts an ID back to an URI, given a base
 * Example:
 *  idToUri('Tim_Berners-Lee', 'http://dbpedia.org/page') returns 'http://dbpedia.org/page/Tim_Berners-Lee'
 */
export function idToUri(id, { base, encoding } = {}) {
  return encoding === true ? Base64.decode(id) : `${base}/${id}`;
}

export function generateMediaUrl(url, width, height) {
  const urlParts = [];
  if (typeof url === 'string') {
    urlParts.push(`url=${encodeURIComponent(url)}`);
  }
  if (typeof width === 'number') {
    urlParts.push(`width=${encodeURIComponent(width)}`);
  }
  if (typeof height === 'number') {
    urlParts.push(`height=${encodeURIComponent(height)}`);
  }
  return `/api/media${urlParts.length > 0 ? `?${urlParts.join('&')}` : ''}`;
}
