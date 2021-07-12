import SparqlClient from '@helpers/sparql';
import { getQueryObject } from '@helpers/utils';
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

export async function getVocabularyItems(vocabularyId, options = { language: 'en' }) {
  const results = [];

  const vocabulary = config.vocabularies[vocabularyId];
  if (!vocabulary) {
    console.warn('Tried to get non-existing vocabulary with id:', vocabularyId);
    return [];
  }

  // Call the endpoint with the search query
  const searchQuery = getQueryObject(vocabulary.query, { language: options.language });
  const resSearch = await SparqlClient.query(searchQuery, {
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
      const itemVocabs = Array.isArray(item[key]) ? item[key] : [item[key]].filter((x) => x && (typeof x !== 'object' || Object.keys(x) > 0));
      itemVocabs.forEach((itemVocab, j) => {
        const vocabulary = vocabularies.find((v) => v['@id'] === itemVocab['@id']);
        if (vocabulary) {
          itemVocabs[j] = { ...itemVocabs[j], ...vocabulary };
        }
      });
      item[key] = itemVocabs.filter((x) => x);
    }
  }
}

export function getEntityMainLabel(entity, { route, language }) {
  if (typeof route === 'object' && typeof route.labelFunc === 'function') {
    return route.labelFunc(entity);
  }

  if (typeof entity.label === 'undefined') {
    return undefined;
  }

  const labels = Array.isArray(entity.label) ? entity.label : [entity.label];

  // Pick labels which match the language
  let targetLabels = labels.filter((label) => label['@language'] === language);

  // If no labels match the language, pick those without a language
  if (targetLabels.length === 0) {
    targetLabels = labels.filter((label) => typeof label['@language'] !== 'string');
  }

  // If no labels without a language, fall back to the first label we find
  if (targetLabels.length === 0 && labels.length > 0) {
    targetLabels = [labels[0]];
  }

  // Return label value as a string
  return targetLabels
    .map((label) => {
      if (typeof label === 'object') {
        if (typeof label.value === 'string') {
          return label.value;
        }
        if (typeof label['@value'] === 'string') {
          return label['@value'];
        }
      } else if (typeof label === 'string') {
        return label;
      }
      return undefined;
    })
    .join(', ');
}

export const getEntityMainImage = (result, { route }) => {
  let mainImage = null;

  if (typeof route.imageFunc === 'function') {
    mainImage = route.imageFunc(result);
  } else if (result.representation && result.representation.image) {
    mainImage = Array.isArray(result.representation.image)
      ? result.representation.image.shift()
      : result.representation.image;
  } else if (Array.isArray(result.representation)) {
    mainImage =
      result.representation[0].image || result.representation[0]['@id'] || result.representation[0];
  }

  return mainImage;
};
