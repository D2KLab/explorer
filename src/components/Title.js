import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';

/**
 * A styled component that creates a title element with padding.
 * @returns {React.Component} A styled component that creates a title element.
 */
const Title = styled.h1`
  padding: 0 24px;
  margin-top: 24px;

  ${breakpoints.weirdMedium`
    padding: 0 48px;
  `}
`;

export default Title;
