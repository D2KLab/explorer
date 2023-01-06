import { forwardRef } from 'react';
import styled from 'styled-components';
import { Button as ReakitButton } from 'ariakit';

import Spinner from '@components/Spinner';

const Container = styled(ReakitButton)`
  font-size: 1rem;
  padding: 0.5em;
  appearance: none;
  border: none;
  border-radius: 0;
  cursor: pointer;
  text-decoration: none;
  background-color: ${({ bg, theme, primary, secondary }) => {
    if (primary) {
      return theme.colors.primary;
    }
    if (secondary) {
      return theme.colors.secondary;
    }
    return bg || '#000';
  }};
  color: ${({ text }) => text || '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ text }) => text || '#fff'};
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
      0px 2px 1px -1px rgba(0, 0, 0, 0.12);
  }

  &:disabled {
    cursor: default;
    pointer-events: none;
    opacity: 0.5;
  }

  transition: opacity 250ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  opacity: ${({ loading }) => (loading ? 0.5 : 1)};
  pointer-events: ${({ loading }) => (loading ? 'none' : 'auto')};
`;

const StyledSpinner = styled(Spinner)`
  margin-right: 0.5rem;
`;

/**
 * A styled button component.
 * @param {boolean} [loading=false] - Whether the button is loading.
 * @param {boolean} [primary=false] - Whether the button is primary.
 * @param {boolean} [secondary=false] - Whether the button is secondary.
 * @param {string} href - The href of the button.
 * @param {React.ReactNode} children - The children of the button.
 * @param {React.Ref<any>} ref - The ref of the button.
 * @returns A styled button component.
 */
const Button = forwardRef(({ loading, primary, secondary, href, children, ...props }, ref) => (
  <Container
    {...props}
    as={href ? 'a' : null}
    href={href}
    ref={ref}
    loading={loading ? 1 : undefined}
    primary={primary ? 1 : undefined}
    secondary={secondary ? 1 : undefined}
  >
    {loading && <StyledSpinner color="#fff" size={24} />}
    {children}
  </Container>
));

Button.displayName = 'Button';

export default Button;
