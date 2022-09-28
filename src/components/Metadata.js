import styled from 'styled-components';

import Element from '@components/Element';

/**
 * Metadata with label and value(s).
 *
 * ```
 * <Metadata label="Your label">
 *  Your values
 * </Metadata>
 * ```
 */

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

function Metadata({ className, label, labelStyle, valueStyle, children }) {
  return <Element as="dl" marginY="1em" className={className}>
    <Label style={labelStyle}>{label}</Label>
    <Data style={valueStyle}>{children}</Data>
  </Element>
}

export default Metadata;
