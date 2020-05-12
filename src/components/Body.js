import styled from 'styled-components';

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

  ${breakpoints.weirdMedium`
    flex-direction: row;
  `}

  ${ContentContainer} {
    flex: 1;
  }
`;

const Body = ({ className, children }) => {
  return <Container className={className}>{children}</Container>;
};

export default Body;
