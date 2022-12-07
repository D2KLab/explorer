import styled, { css } from 'styled-components';

import { useGraphs } from '@helpers/useGraphs';

/**
 * Displays a graph icon, given a graph URI. The icon has to be set in config.js.
 */

const StyledImage = styled.img`
  ${({ size }) =>
    css`
      width: ${size}px;
      height: ${size}px;
      object-fit: contain;
    `}

  ${({ theme }) => theme?.components?.GraphIcon?.StyledImage};
`;

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
