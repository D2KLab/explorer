import SparqlClient from '@helpers/sparql';
import { getQueryObject } from '@helpers/utils';
import config from '~/config';

const vocabulariesCache = {};

/**
 * Gets the vocabulary items for the given vocabulary id.
 * @param {string} vocabularyId - the id of the vocabulary to get items for.
 * @param {object} [options={}] - the options object.
 * @param {string} [options.language='en'] - the language to get items for.
 * @returns {Promise<Array<VocabularyItem>>} - the vocabulary items for the given id.
 */
export async function getVocabularyItems(vocabularyId, options = { language: 'en' }) {
  const results = [];

  const vocabulary = config.vocabularies[vocabularyId];
  if (!vocabulary) {
    console.warn('Tried to get non-existing vocabulary with id:', vocabularyId);
    return [];
  }

  // Call the endpoint with the search query
  const searchQuery = getQueryObject(vocabulary.query, options);
  const resSearch = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
    params: config.api.params,
  });

  if (resSearch) {
    results.push(...resSearch['@graph']);
  }

  return results;
}

/**
 * Takes in an item and fills in the vocabularies for the item.
 * For example, if the item has a key `{ foo: { "@id": "http://bar" } }`
 * 1. It checks if the vocabulary "foo" exists in the configuration file
 * 2. Then it calls the API route to get a cached version of the vocabulary
 * 3. Finally it replaces the original key with additional values (eg. label)
 * Final item: `{ foo: { "@id": "http://bar", "label": "Bar" } }`
 * @param {object} item - the item to fill in the vocabularies for.
 * @param {object} options - the options to use when getting the vocabularies.
 * @returns None
 */
export async function fillWithVocabularies(item, options) {
  const keys = Object.keys(item);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key in config.vocabularies) {
      if (typeof vocabulariesCache[key] === 'undefined') {
        vocabulariesCache[key] = await getVocabularyItems(key, options);
      }
      const vocabularies = vocabulariesCache[key];
      const itemVocabs = Array.isArray(item[key])
        ? item[key]
        : [item[key]].filter((x) => x && (typeof x !== 'object' || Object.keys(x) > 0));
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
