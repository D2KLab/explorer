/* eslint-disable class-methods-use-this */
const NodeCache = require('node-cache');
const sparqlTransformer = require('sparql-transformer').default;

class SparqlClient {
  constructor() {
    this.cache = new NodeCache();
  }

  async getSparqlQuery(query) {
    let sparqlQuery = null;
    try {
      await sparqlTransformer(query, {
        debug: false,
        sparqlFunction: (sparql) => {
          sparqlQuery = sparql.trim();
          return Promise.reject();
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-empty
    }
    return sparqlQuery;
  }

  async query(query, { endpoint, debug, ttl = 0 } = {}) {
    const sparqlQuery = await this.getSparqlQuery(query);
    if (sparqlQuery) {
      const cachedRes = this.cache.get(sparqlQuery);
      if (typeof cachedRes !== 'undefined') {
        return cachedRes;
      }
    }
    try {
      const res = await sparqlTransformer(query, {
        endpoint,
        debug,
      });
      if (sparqlQuery) {
        this.cache.set(sparqlQuery, res, ttl);
      }
      return res;
    } catch (err) {
      console.error(err);
    }
    return null;
  }
}

module.exports = new SparqlClient();
