import config from '~/config';

/**
 * A React component that renders a link to a SPARQL endpoint.
 * @param {string} query - the SPARQL query to link to
 * @param {React.ReactNode} children - the children to render
 * @returns A React component that renders a link to a SPARQL endpoint.
 */
function SPARQLQueryLink({ query, children }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={
        typeof config.api.queryLink === 'function'
          ? config.api.queryLink(query)
          : `${config.api.endpoint}?qtxt=${encodeURIComponent(query)}&format=text%2Fhtml`
      }
    >
      {children}
    </a>
  );
}

export default SPARQLQueryLink;
