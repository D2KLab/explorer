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

const Label = styled.span`
  display: block;
  color: #666;
  font-size: 0.7rem;
  text-transform: uppercase;
`;

const Data = styled.span`
  font-weight: 400;
`;

const Metadata = ({ className, label, children }) => {
  return (
    <Element marginY="1em" className={className}>
      <Label>{label}</Label>
      <Data>{children}</Data>
    </Element>
  );
};

export default Metadata;
