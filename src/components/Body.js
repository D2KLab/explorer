import styled, { css } from 'styled-components';

import { Container as ContentContainer } from '@components/Content';
import { breakpoints } from '@styles';

/**
 * Flex body container.
 *
 * ```
 * <Layout>
 *  <Body>
 *    Your content
 *  </Body>
 * </Layout>
 * ```
 */

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${({ hasSidebar }) =>
    hasSidebar
      ? css`
          ${breakpoints.weirdMedium`
      flex-direction: row;
    `}
        `
      : null};

  ${ContentContainer} {
    flex: 1;
  }
`;

const Body = ({ className, hasSidebar, children }) => {
  return (
    <Container className={className} hasSidebar={hasSidebar}>
      {children}
    </Container>
  );
};

export default Body;
