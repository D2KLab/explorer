import config from '~/config';

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
