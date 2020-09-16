import { createGlobalStyle } from 'styled-components';
import theme from '~/theme';

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
    font-size: 1em;
    line-height: 1.5;
  }

  a {
    color: ${theme.colors.primary};
  }

  a:hover {
    color: ${theme.colors.linkHover};
  }

  pre {
    font-family: ${theme.fontFamily.mono};
    font-size: 0.7rem;
    outline: 1px solid #ccc;
    padding: 10px;
    margin: 10px;
    overflow: auto;
    white-space: pre-wrap;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    max-height: 280px;
  }

  strong, b {
    font-weight: bold;
  }

  h1 {
    font-size: 2rem;
    font-weight: 400;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 400;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: bold;
  }

  h4, h5, h6 {
    font-size: 1rem;
    font-weight: bold;
  }

  p {
    margin: 1rem 0;
  }
`;
