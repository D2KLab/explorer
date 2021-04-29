import styled, { css } from 'styled-components';

import config from '~/config';

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

const GraphIcon = ({ className, size = 24, uri, style }) => {
  const graph = config.graphs[uri];
  if (!graph) {
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
};

export default GraphIcon;
