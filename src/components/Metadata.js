import styled from 'styled-components';

import Element from '@components/Element';

const Label = styled.dt`
  height: 0.875rem;
  line-height: 0.875rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  white-space: nowrap;
  color: #666;
  font-weight: 500;
`;

const Data = styled.dd`
  font-size: 0.875rem;
  line-height: 1rem;
  color: #000;
  font-weight: 500;
`;

/**
 * A component that displays metadata with a label and value(s)
 * @param {string} className - The class name to apply to the element.
 * @param {string} label - The label to display.
 * @param {string} labelStyle - The style to apply to the label.
 * @param {string} valueStyle - The style to apply to the value.
 * @param {string} children - The value to display.
 * @returns A component that displays metadata with a label and value(s)
 */
function Metadata({ className, label, labelStyle, valueStyle, children }) {
  return (
    <Element as="dl" marginY="1em" className={className}>
      <Label style={labelStyle}>{label}</Label>
      <Data style={valueStyle}>{children}</Data>
    </Element>
  );
}

export default Metadata;
