/**
 * Takes in a URI and returns the ID of the resource.
 * Example:
 *  uriToId('http://dbpedia.org/page/Tim_Berners-Lee', { base: 'http://dbpedia.org/page' }) returns 'Tim_Berners-Lee'
 * @param {string} uriPart - the URI to parse
 * @param {object} [options] - the options object
 * @param {string} [options.base] - the base URI
 * @returns {string} the ID of the resource
 */
export function uriToId(uriPart, { base }) {
  const id = typeof base !== 'undefined' ? uriPart.substr(base.length + 1) : uriPart;
  return id;
}

/**
 * Takes in an ID and returns the full URI.
 * Example:
 *  idToUri('Tim_Berners-Lee', { base: 'http://dbpedia.org/page' }) returns 'http://dbpedia.org/page/Tim_Berners-Lee'
 * @param {string} id - the ID to convert to a URI
 * @param {string} [base] - the base URI to use
 * @returns {string} the full URI
 */
export function idToUri(id, { base }) {
  if (id.startsWith(base)) return id;
  const uri = typeof base !== 'undefined' ? `${base}/${id}` : id;
  return uri;
}

/**
 * Generates a URL to a media file.
 * @param {string} url - the URL of the media file.
 * @param {number} [width] - the width of the media file.
 * @param {number} [height] - the height of the media file.
 * @returns {string} the URL to the media file.
 */
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

/**
 * Takes in an object and removes any empty objects or null values.
 * @param {object} obj - the object to remove empty objects from
 * @returns {object} the cleaned object
 */
export function removeEmptyObjects(obj) {
  Object.entries(obj).forEach(([k, v]) => {
    if (v && typeof v === 'object') {
      removeEmptyObjects(v);
    }
    if (
      (v && typeof v === 'object' && !Object.keys(v).length) ||
      v === null ||
      typeof v === 'undefined'
    ) {
      if (Array.isArray(obj)) {
        obj.splice(k, 1);
      } else if (!Array.isArray(obj[k])) {
        delete obj[k];
      }
    }
  });
  return obj;
}

/**
 * Takes in a query object and returns a query object with the correct language and params.
 * @param {string | Function} query - the query object or function that returns a query object.
 * @param {object} [options={}] - the options object.
 * @returns {object} - the query object with the correct language and params.
 */
export function getQueryObject(query, options = { language: 'en', params: {} }) {
  if (typeof query === 'function') {
    return { ...query(options) };
  }
  return { ...query };
}

/**
 * Takes in a string and returns a slugified version of it.
 * @param {string} text - the string to slugify
 * @returns {string} - the slugified string
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Takes in a string of text and replaces any URLs, email addresses, and email addresses with
 * HTML links.
 * @param {string} text - the text to linkify
 * @returns {string} the text with links
 */
export function linkify(text) {
  if (typeof text !== 'string') return text;

  let replacedText;

  // URLs starting with http://, https://, or ftp://
  const replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
  replacedText = text.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

  // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  const replacePattern2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>',
  );

  // Change email addresses to mailto:: links.
  const replacePattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

  return replacedText;
}
