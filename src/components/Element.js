import { layout, space, flexbox } from '@techstack/styled-system';
import styled from 'styled-components';

/**
 * A styled component that applies the layout, space, and flexbox CSS properties.
 * @returns {React.Component} A styled component that applies the layout, space, and flexbox CSS properties.
 */
const Element = styled.div`
  ${layout}
  ${space}
  ${flexbox}
`;

export default Element;
