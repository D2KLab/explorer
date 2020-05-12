import styled from 'styled-components';

/**
 * Padded content container.
 */

export const Container = styled.div`
  padding: 24px 48px;
`;

const Content = ({ className, children }) => {
  return <Container className={className}>{children}</Container>;
};

export default Content;
