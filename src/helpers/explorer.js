import { createHmac } from 'crypto';

import config from '~/config';

/**
 * Finds the route that matches the given RDF type.
 * @param {string | string[]} type - the RDF type to find a route for
 * @returns {string[]} if the route matches, an array with two elements (`[routeName, route]`), or an empty array (`[]`) if the route was not found.the route that matches the given RDF type
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

/**
 * Gets the main label for an entity.
 * @param {Entity} entity - the entity to get the label for.
 * @param {Route} route - the route to get the label for.
 * @param {string} language - the language to get the label for.
 * @returns {string} the main label for the entity.
 */
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

/**
 * Get the main image for an entity.
 * @param {object} result - the entity object
 * @param {object} route - the route object
 * @returns {string} the main image for the entity
 */
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

/**
 * Generates a permalink for the given URI.
 * @param {string} uri - the URI to generate a permalink for.
 * @returns {string} the permalink for the given URI.
 */
export const generatePermalink = (uri) => {
  if (typeof config.api.permalinkUrl === 'function') {
    return config.api.permalinkUrl(uri);
  }
  return uri;
};

/**
 * Gets the search data for the given query.
 * @param {object} query - The query object.
 * @param {string} locale - The locale of the user.
 * @returns {object} The search data.
 */
export const getSearchData = async ({ query, locale }) => {
  if (!query.sapi) {
    return null;
  }

  const searchParams = new URLSearchParams(query);
  searchParams.set('type', searchParams.get('stype'));
  searchParams.set('id', searchParams.get('sid'));
  searchParams.delete('sid');
  searchParams.delete('stype');
  searchParams.delete('sapi');
  searchParams.delete('spath');

  const searchData = await (
    await fetch(`${process.env.SITE}${query.sapi}?${searchParams}`, {
      headers: {
        'accept-language': locale,
      },
    })
  ).json();

  return searchData;
};

/**
 * Generates a URL for inviting a user to a list.
 * @param {List} list - the list to invite a user to
 * @returns {string} the URL for inviting a user to a list
 */
export const generateListInviteId = (list) => {
  const secret = process.env.NEXTAUTH_SECRET;
  const inviteId = createHmac('sha256', secret).update(list._id.toString()).digest('hex');
  return inviteId;
};
