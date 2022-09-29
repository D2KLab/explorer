import styled, { css } from 'styled-components';

import Content from '@components/Content';
import breakpoints from '@styles/breakpoints';

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

  ${({ theme }) =>
    css`
      min-height: calc(
        100vh - ${theme.header.height} - ${theme.header.borderBottomWidth} -
          ${theme.footer.minHeight}
      );
    `};

  ${({ hasSidebar }) =>
    hasSidebar
      ? css`
          ${Content} {
            flex: 1;
          }
          ${breakpoints.weirdMedium`
            flex-direction: row;
          `}
        `
      : null};
`;

function Body({ className, hasSidebar, children }) {
  return (
    <Container className={className} hasSidebar={hasSidebar} role="main">
      {children}
    </Container>
  );
}

export default Body;
