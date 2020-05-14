import styled from 'styled-components';

import config from '~/config';

/**
 * Displays a graph icon, given a graph URI. The icon has to be set in config.js.
 */

const StyledImage = styled.img`
  height: 24px;
  margin-bottom: 1em;
`;

const GraphIcon = ({ uri }) => {
  const graph = config.graphs[uri];
  if (!graph) {
    return null;
  }
  return (<StyledImage src={graph.icon} title={graph.label} alt={graph.label} />);
};

export default GraphIcon;
