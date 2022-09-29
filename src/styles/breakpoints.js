import { css } from 'styled-components';

export const sizes = {
  mobile: 576,
  weirdMedium: 696,
  tablet: 768,
  desktop: 992,
  largeDesktop: 1200,
};

export const customBreakpoint = (size, ...args) => {
  const emSize = size / 16;
  return css`
    @media (min-width: ${emSize}em) {
      ${css(...args)}
    }
  `;
};

export default Object.keys(sizes).reduce((accumulator, label) => {
  const emSize = sizes[label] / 16;
  accumulator[label] = (...args) => css`
    @media (min-width: ${emSize}em) {
      ${css(...args)}
    }
  `;
  return accumulator;
}, {});
