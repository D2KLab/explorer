import styled from 'styled-components';

import breakpoints from '@styles/breakpoints';

/**
 * A styled component that adds padding to the top and bottom of the component.
 * @returns {React.ReactElement} A styled component that adds padding to the top and bottom of the component.
 */
export default styled.div`
  padding: 12px 24px;

  ${breakpoints.weirdMedium`
    padding: 24px 48px;
  `}
`;
