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
  Object
    .entries(obj)
    .forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        removeEmptyObjects(v);
      }
      if (v && typeof v === 'object' && !Object.keys(v).length || v === null || typeof v === 'undefined') {
        if (Array.isArray(obj)) {
          obj.splice(k, 1);
        } else if (!Array.isArray(obj[k])) {
          delete obj[k];
        }
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

export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
};

export function linkify(text) {
  let replacedText;

  // URLs starting with http://, https://, or ftp://
  const replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = text.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

  // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

  // Change email addresses to mailto:: links.
  const replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

  return replacedText;
}
