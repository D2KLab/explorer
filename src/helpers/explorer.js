import config from '~/config';

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
