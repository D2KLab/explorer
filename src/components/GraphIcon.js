import styled, { css } from 'styled-components';

import { useGraphs } from '@helpers/useGraphs';

const StyledImage = styled.img`
  ${({ size }) =>
    css`
      width: ${size}px;
      height: ${size}px;
      object-fit: contain;
    `}

  ${({ theme }) => theme?.components?.GraphIcon?.StyledImage}
`;

/**
 * A component that renders an icon for a graph. The icon has to be set in config.js.
 * @param {string} className - The class name to apply to the icon.
 * @param {number} [size=24] - The size of the icon.
 * @param {string} uri - The URI of the graph.
 * @param {object} [style] - The style to apply to the icon.
 * @returns A React component that renders an icon for a graph.
 */
function GraphIcon({ className, size = 24, uri, style }) {
  const graphs = useGraphs();
  const graph = graphs[uri];
  if (!graph || !graph.icon) {
    return null;
  }
  return (
    <StyledImage
      className={className}
      size={size}
      src={graph.icon}
      title={graph.label}
      alt={graph.label}
      style={style}
    />
  );
}

export default GraphIcon;
