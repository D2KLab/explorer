import styled from 'styled-components';

export const Container = styled.div`
  min-height: calc(
    100vh -
      ${({ theme }) =>
        `${theme.header.height} - ${theme.header.borderBottomWidth} - ${theme.footer.minHeight}`}
  );
`;

const Screen = ({ className, children }) => {
  return <Container className={className}>{children}</Container>;
};

export default Screen;
