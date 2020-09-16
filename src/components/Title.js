import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';

/**
 * Title with padding.
 */

const Title = styled.h1`
  padding: 0 24px;
  margin-top: 24px;

  ${breakpoints.weirdMedium`
    padding: 0 48px;
  `}
`;

export default Title;
