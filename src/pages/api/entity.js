import { getServerSession } from 'next-auth';

import { authOptions } from './auth/[...nextauth]';

import { withRequestValidation } from '@helpers/api';
import { getSessionUser, getUserLists } from '@helpers/database';
import SparqlClient from '@helpers/sparql';
import { idToUri, removeEmptyObjects, getQueryObject } from '@helpers/utils';
import { fillWithVocabularies } from '@helpers/vocabulary';
import config from '~/config';

/**
 * Takes in a route and returns a query object that can be used to search for entities
 * @param {Route} route - the route to get the query object for
 * @param {string} language - the language to use for the query
 * @param {object} query - the query object to use for the search
 * @returns {object} - the query object to use for the search
 */
const getEntityQuery = (route, language, query) => {
  try {
    if (!route) {
      return null;
    }
    const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
    const searchQuery = JSON.parse(
      JSON.stringify(getQueryObject(jsonQuery, { language, params: query })),
    );
    searchQuery.$filter = searchQuery.$filter || [];
    if (!searchQuery.$values) {
      searchQuery.$values = {};
    }
    if (!searchQuery.$values['?id']) {
      searchQuery.$values['?id'] = [
        idToUri(query.id, {
          base: route.uriBase,
        }),
      ];
    }
    return searchQuery;
  } catch (error) {
    console.error('Error in getEntityQuery:', error);
    return null;
  }
};

/**
 * Gets the entity for the given query
 * @param {string} query - the query to get the entity for.
 * @param {string} language - the language to get the entity for.
 * @returns {Promise<Entity>} - the entity for the given query.
 */
export const getEntity = async (query, language) => {
  try {
    // Input validation
    if (!query || !query.type) {
      console.warn('Invalid query parameters for getEntity');
      return null;
    }

    const route = config.routes[query.type];
    if (!route) {
      console.warn(`Route not found for type: ${query.type}`);
      return null;
    }

    // Get the query with error handling
    const searchQuery = await getEntityQuery(route, language, query);
    if (!searchQuery) {
      console.warn('Failed to generate search query');
      return null;
    }

    // Set a timeout for the SPARQL query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SPARQL query timed out')), 10000);
    });

    // Execute the query with a timeout
    const queryPromise = SparqlClient.query(searchQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
      params: config.api.params,
    });

    const queryRes = await Promise.race([queryPromise, timeoutPromise]);

    // Validate the query result
    if (!queryRes || !queryRes['@graph'] || !Array.isArray(queryRes['@graph'])) {
      console.warn('Invalid SPARQL query result structure');
      return null;
    }

    const entity = queryRes['@graph'][0] && removeEmptyObjects(queryRes['@graph'][0]);
    if (!entity) {
      console.warn('No entity found in SPARQL query result');
      return null;
    }

    // Try to fill with vocabularies, but don't fail if this step fails
    try {
      await fillWithVocabularies(entity, { params: query });
    } catch (vocabError) {
      console.error('Error filling vocabularies:', vocabError);
      // Continue with the entity we have
    }

    return entity;
  } catch (error) {
    console.error('Error in getEntity:', error);
    console.error('Query:', query);
    return null;
  }
};

/**
 * Checks if the entity is in the user's list
 * @param {string} entityId - the entity's id
 * @param {Query} query - the query object
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 * @returns {boolean} - true if the entity is in the user's list, false otherwise
 */
export const isEntityInList = async (entityId, query, req, res) => {
  try {
    if (!entityId || !req) return false;

    const session = await getServerSession(req, res, authOptions);
    if (!session) return false;

    const user = await getSessionUser(session);
    if (!user) {
      return false;
    }

    // Check if this item is in a user list and flag it accordingly.
    const loadedLists = await getUserLists(user);
    if (!loadedLists || !Array.isArray(loadedLists)) return false;

    return loadedLists.some(
      (list) =>
        list.items &&
        Array.isArray(list.items) &&
        list.items.some((it) => it.uri === entityId && it.type === query.type),
    );
  } catch (error) {
    console.error('Error in isEntityInList:', error);
    return false;
  }
};

/**
 * Takes in a query object and returns the SPARQL query for that object with error handling
 * @param {Query} query - the query object
 * @param {string} language - the language of the query
 * @returns {string} the SPARQL query for the query object
 */
export const getEntityDebugQuery = async (query, language) => {
  try {
    if (!query || !query.type) return '';

    const route = config.routes[query.type];
    if (!route) return '';

    const searchQuery = await getEntityQuery(route, language, query);
    if (!searchQuery) return '';

    return SparqlClient.getSparqlQuery(searchQuery);
  } catch (error) {
    console.error('Error in getEntityDebugQuery:', error);
    return '';
  }
};

/**
 * A route that takes in query parameters and returns a matching entity.
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 */
export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  try {
    const { query } = req;

    // Validate input
    if (!query || !query.type) {
      res.status(400).json({ error: { message: 'Missing required parameters' } });
      return;
    }

    const route = config.routes[query.type];
    if (!route) {
      res.status(404).json({ error: { message: 'Route not found' } });
      return;
    }

    const language = query.hl || req.headers['accept-language'];

    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 15000);
    });

    // Get entity with a timeout
    const entityPromise = getEntity(query, language);

    // Race against timeout
    const entity = await Promise.race([entityPromise, timeoutPromise]);

    if (!entity) {
      res.status(404).json({ error: { message: 'Entity not found' } });
      return;
    }

    const returnValue = {
      result: entity,
      inList: await isEntityInList(entity['@id'], query, req, res),
    };

    if (config.debug) {
      returnValue.debugSparqlQuery = await getEntityDebugQuery(query, language);
    }

    res.status(200).json(returnValue);
  } catch (error) {
    console.error('Error handling entity request:', error);

    // Check if the error is a timeout
    if (error.message === 'Request timed out' || error.message === 'SPARQL query timed out') {
      res.status(504).json({ error: { message: 'Request timed out' } });
    } else {
      res.status(500).json({ error: { message: 'Internal server error' } });
    }
  }
});
