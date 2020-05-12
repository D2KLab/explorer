import { createGlobalStyle } from 'styled-components';
import theme from '@styles/theme';

export default createGlobalStyle`
  html {
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  body {
    font-family: ${theme.fontFamily.sansSerif};
    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
  }

  a {
    color: ${theme.colors.primary};
  }

  a:hover {
    color: ${theme.colors.linkHover};
  }

  pre {
    font-family: ${theme.fontFamily.mono};
    font-size: 0.7em;
    overflow: auto;
    white-space: pre-wrap;
    max-height: 280px;
  }
`;
