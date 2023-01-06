import styled from 'styled-components';

/**
 * A styled input element.
 * @returns {React.Component} - A styled input element.
 */
const Input = styled.input`
  background-color: #f0f0f0;
  border-style: solid;
  border-color: #000;
  border-width: 0;
  border-bottom-width: 2px;
  border-radius: 0;
  outline: 0;
  box-sizing: border-box;
  font-size: 1rem;
  min-height: 38px;
  padding: 0 8px;

  &:focus {
    box-shadow: 0 0 1 #ccc;
    border-width: 2px;
  }
`;

export default Input;
