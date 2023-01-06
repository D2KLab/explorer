import GraphIcon from '@components/GraphIcon';
import { useGraphs } from '@helpers/useGraphs';

/**
 * A React component that renders a link to a graph. The url has to be set in config.js.
 * @param {string} className - The class name to apply to the link.
 * @param {object} style - The style to apply to the link.
 * @param {string} target - The target to apply to the link.
 * @param {string} rel - The rel to apply to the link.
 * @param {string} uri - The uri of the graph to link to.
 * @param {string} icon - The icon to render before the label.
 * @param {string} label - The label to render after the icon.
 * @return
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
  const graphs = useGraphs();
  const graph = graphs[uri];
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
