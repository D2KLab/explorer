import styled from 'styled-components';

import { breakpoints } from '@styles';

/**
 * Padded content container.
 */

export default styled.div`
  padding: 12px 24px;

  ${breakpoints.weirdMedium`
    padding: 24px 48px;
  `}
`;
