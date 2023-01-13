import { withRequestValidation } from '@helpers/api';
import SparqlClient from '@helpers/sparql';
import { getQueryObject, removeEmptyObjects } from '@helpers/utils';
import config from '~/config';

/**
 * Gets the graphs for the given language.
 * @param {string} language - the language to get the graphs for.
 * @returns {Promise<object>} - the graphs for the given language.
 */
const getGraphs = async (language) => {
  if (typeof config.graphs === 'function') {
    const graphsQuery = getQueryObject(config.graphs(), { language });
    const resGraphs = await SparqlClient.query(graphsQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
      params: config.api.params,
    });
    const graphs = removeEmptyObjects(resGraphs['@graph']).reduce((acc, cur) => {
      const graph = {};
      if (cur.label) {
        graph.label = cur.label;
      }
      if (cur.image) {
        graph.image = cur.image;
      }
      acc[cur['@id']] = graph;
      return acc;
    }, {});
    return graphs;
  }
  if (typeof config.graphs === 'object') {
    return config.graphs;
  }
  return {};
};

/**
 * A route that returns a list of graphs.
 * @param {string} [hl] - The language to use for the graphs.
 * @returns A list of graphs.
 */
export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const { query } = req;
  const graphs = await getGraphs(query.hl || req.headers['accept-language']);
  res.status(200).json(graphs);
});
