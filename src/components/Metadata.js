import styled from 'styled-components';

/**
 * Metadata with label and value(s).
 *
 * ```
 * <Metadata label="Your label">
 *  Your values
 * </Metadata>
 * ```
 */

const Container = styled.div`
  margin-bottom: 1em;
`;

const Label = styled.span`
  display: block;
  color: #aaa;
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
    <Container className={className}>
      <Label>{label}</Label>
      <Data>{children}</Data>
    </Container>
  );
};

export default Metadata;
