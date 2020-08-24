import SparqlClient from '@helpers/sparql';
import config from '~/config';

const vocabulariesCache = {};

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
      if (!vocabulariesCache[key]) {
        // eslint-disable-next-line no-await-in-loop
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
