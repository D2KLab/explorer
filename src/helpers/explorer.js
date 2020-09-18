import SparqlClient from '@helpers/sparql';
import config from '~/config';

const vocabulariesCache = {};

/*
 * Find a route from config based on its RDF type.
 * Returns an Array with two elements (`[routeName, route]`), or
 * an empty array (`[]`) if the route was not found.
 */
export function findRouteByRDFType(type) {
  const rdfTypes = Array.isArray(type) ? type : [type];
  return (
    Object.entries(config.routes).find(([, r]) => {
      if (Array.isArray(r.rdfType)) {
        return r.rdfType.some((rdfType) => rdfTypes.includes(rdfType));
      }
      if (typeof r.rdfType === 'string') {
        return rdfTypes.includes(r.rdfType);
      }
      return false;
    }) || []
  );
}

export async function getVocabularyItems(vocabularyId) {
  const results = [];

  const vocabulary = config.vocabularies[vocabularyId];
  if (!vocabulary) {
    console.warn('Tried to get non-existing vocabulary with id:', vocabularyId);
    return [];
  }

  // Call the endpoint with the search query
  const resSearch = await SparqlClient.query(vocabulary.query, {
    endpoint: config.api.endpoint,
    debug: config.debug,
  });

  if (resSearch) {
    results.push(...resSearch['@graph']);
  }

  return results;
}

/*
 * Fill item object with vocabularies labels
 * For example, if the item has a key `{ foo: { "@id": "http://bar" } }`
 * 1. It checks if the vocabulary "foo" exists in the configuration file
 * 2. Then it calls the API route to get a cached version of the vocabulary
 * 3. Finally it replaces the original key with additional values (eg. label)
 * Final item: `{ foo: { "@id": "http://bar", "label": "Bar" } }`
 */
export async function fillWithVocabularies(item) {
  const keys = Object.keys(item);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key in config.vocabularies) {
      if (typeof vocabulariesCache[key] === 'undefined') {
        vocabulariesCache[key] = await getVocabularyItems(key);
      }
      const vocabularies = vocabulariesCache[key];
      const itemVocabs = Array.isArray(item[key]) ? item[key] : [item[key]].filter((x) => x);
      itemVocabs.forEach((itemVocab, j) => {
        itemVocabs[j] = vocabularies.find((v) => v['@id'] === itemVocab['@id']);
      });
      item[key] = itemVocabs.filter((x) => x);
    }
  }
}

export function getEntityLabelForRoute(entity, route) {
  if (typeof route.labelFunc === 'function') {
    return route.labelFunc(entity);
  }

  if (typeof entity.label === 'object' && typeof entity.label.value === 'string') {
    return entity.label.value;
  }

  if (typeof entity.label === 'string') {
    return entity.label;
  }

  return entity.label || null;
}
