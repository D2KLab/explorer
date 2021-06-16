import GraphIcon from '@components/GraphIcon';

import config from '~/config';

/**
 * Displays a graph link, given a graph URI. The url has to be set in config.js.
 */

const GraphLink = ({
  className,
  style,
  target = '_blank',
  rel = 'noopener noreferrer',
  uri,
  icon,
  label,
}) => {
  const graph = config.graphs[uri];
  return (
    <a className={className} href={graph.url} target={target} rel={rel} style={style}>
      {icon && <GraphIcon uri={uri} style={{ verticalAlign: 'top' }} />}
      {label && <small style={{ marginLeft: '0.5em' }}>{graph.label}</small>}
    </a>
  );
};

export default GraphLink;
