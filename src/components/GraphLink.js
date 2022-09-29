import GraphIcon from '@components/GraphIcon';

import config from '~/config';

/**
 * Displays a graph link, given a graph URI. The url has to be set in config.js.
 */

function GraphLink({
  className,
  style = {},
  target = '_blank',
  rel = 'noopener noreferrer',
  uri,
  icon,
  label,
}) {
  const graph = config.graphs[uri];
  if (!graph) return null;
  return (
    <a
      className={className}
      href={graph.url}
      target={target}
      rel={rel}
      style={{ display: 'flex', alignItems: 'center', ...style }}
    >
      {icon && <GraphIcon uri={uri} style={{ marginRight: '0.5em' }} />}
      {label && <small>{graph.label}</small>}
    </a>
  );
}

export default GraphLink;
