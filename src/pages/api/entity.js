import { unstable_getServerSession } from 'next-auth';

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
  if (!route) {
    return null;
  }
  const jsonQuery = route.details && route.details.query ? route.details.query : route.query;
  const searchQuery = JSON.parse(
    JSON.stringify(getQueryObject(jsonQuery, { language, params: query }))
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
};

/**
 * Gets the entity for the given query.
 * @param {string} query - the query to get the entity for.
 * @param {string} language - the language to get the entity for.
 * @returns {Promise<Entity>} - the entity for the given query.
 */
export const getEntity = async (query, language) => {
  const route = config.routes[query.type];
  if (!route) {
    return null;
  }

  const searchQuery = await getEntityQuery(route, language, query);
  if (!searchQuery) {
    return null;
  }

  const queryRes = await SparqlClient.query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
    params: config.api.params,
  });

  const entity = queryRes && queryRes['@graph'][0] && removeEmptyObjects(queryRes['@graph'][0]);
  if (!entity) {
    return null;
  }

  await fillWithVocabularies(entity, { params: query });

  return entity;
};

/**
 * Checks if the entity is in the user's list.
 * @param {string} entityId - the entity's id
 * @param {Query} query - the query object
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 * @returns {boolean} - true if the entity is in the user's list, false otherwise
 */
export const isEntityInList = async (entityId, query, req, res) => {
  if (!entityId || !req) return false;

  const session = await unstable_getServerSession(req, res, authOptions);
  const user = await getSessionUser(session);
  if (!user) {
    return false;
  }

  // Check if this item is in a user list and flag it accordingly.
  const loadedLists = await getUserLists(user);
  return loadedLists.some((list) =>
    list.items.some((it) => it.uri === entityId && it.type === query.type)
  );
};

/**
 * Takes in a query object and returns the SPARQL query for that object.
 * @param {Query} query - the query object
 * @param {string} language - the language of the query
 * @returns {string} the SPARQL query for the query object
 */
export const getEntityDebugQuery = async (query, language) => {
  const route = config.routes[query.type];
  const searchQuery = await getEntityQuery(route, language, query);
  return SparqlClient.getSparqlQuery(searchQuery);
};

/**
 * A route that takes in query parameters and and returns a matching entity.
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 */
export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;

  const route = config.routes[query.type];
  if (!route) {
    res.status(404).json({ error: { message: 'Route not found' } });
    return;
  }

  const language = query.hl || req.headers['accept-language'];

  const entity = await getEntity(query, language);

  const returnValue = {
    result: entity,
    inList: await isEntityInList(entity['@id'], query, req, res),
  };

  if (config.debug) {
    returnValue.debugSparqlQuery = await getEntityDebugQuery(query, language);
  }

  res.status(200).json(returnValue);
});
