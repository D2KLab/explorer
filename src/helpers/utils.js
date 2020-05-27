/**
 * Gets the last part of an URI
 * Example:
 *  uriToId('http://dbpedia.org/page/Tim_Berners-Lee') returns 'Tim_Berners-Lee'
 */
export function uriToId(uri) {
  return uri.substr(uri.lastIndexOf('/') + 1);
}

/**
 * Converts an ID back to an URI, given a base
 * Example:
 *  idToUri('Tim_Berners-Lee', 'http://dbpedia.org/page') returns 'http://dbpedia.org/page/Tim_Berners-Lee'
 */
export function idToUri(id, base) {
  return `${base}/${id}`;
}
