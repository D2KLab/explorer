import styled from 'styled-components';

import { breakpoints } from '@styles';

/**
 * Padded content container.
 */

export const Container = styled.div`
  padding: 12px 24px;

  ${breakpoints.weirdMedium`
    padding: 24px 48px;
  `}
`;

const Content = ({ className, children }) => {
  return <Container className={className}>{children}</Container>;
};

export default Content;
