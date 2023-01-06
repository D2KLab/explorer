import styled, { css } from 'styled-components';

import Content from '@components/Content';
import breakpoints from '@styles/breakpoints';

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

/**
 * A React component that wraps the children in a flex container.
 * ```jsx
 * <Layout>
 *  <Body>
 *    Your content
 *  </Body>
 * </Layout>
 * ```
 * @param {string} className - The class name to apply to the container.
 * @param {boolean} hasSidebar - Whether or not the sidebar is present.
 * @param {ReactNode} children - The children to render.
 * @returns A React component that wraps the children in a flex container.
 */
function Body({ className, hasSidebar, children }) {
  return (
    <Container className={className} hasSidebar={hasSidebar} role="main">
      {children}
    </Container>
  );
}

export default Body;
