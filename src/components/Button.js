import styled from 'styled-components';

const Button = styled.button`
  font-size: 1rem;
  flex: 0 1 120px;
  padding: 0.5em;
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;

  &:hover {
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
      0px 2px 1px -1px rgba(0, 0, 0, 0.12);
  }
`;

export default Button;
