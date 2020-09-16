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
  font-size: 0.7em;
  text-transform: uppercase;
`;

const Data = styled.span`
  font-weight: 400;
  font-size: 1rem;
  line-height: 2rem;
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
