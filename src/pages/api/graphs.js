import SparqlClient from '@helpers/sparql';
import { withRequestValidation } from '@helpers/api';
import { getQueryObject, removeEmptyObjects } from '@helpers/utils';
import config from '~/config';

const getGraphs = async () => {
  if (typeof config.graphs === 'function') {
    const graphsQuery = getQueryObject(config.graphs());
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

export default withRequestValidation({
  allowedMethods: ['GET'],
})(async (req, res) => {
  const graphs = await getGraphs();
  res.status(200).json(graphs);
});
