import { createGlobalStyle } from 'styled-components';

import theme from '~/theme';

export default createGlobalStyle`
  html {
    font-size: 16px;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
    text-rendering: geometricPrecision;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: ${theme.fontFamily.sansSerif};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-size: 1rem;
    line-height: 1.5;
    padding: 0;
    min-height: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  a {
    color: ${theme.colors.link || theme.colors.primary};
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
    font-weight: 700;
  }

  h1 {
    font-size: 3rem;
    letter-spacing: -.066875rem;
    line-height: 1.5;
    font-weight: 700;
  }

  h2 {
    font-size: 2.25rem;
    letter-spacing: -.020625rem;
  }

  h3 {
    font-size: 1.5rem;
    letter-spacing: -.029375rem;
  }

  h4 {
    font-size: 1.25rem;
    letter-spacing: -.020625rem;
  }

  h5 {
    font-size: 1rem;
    letter-spacing: -.01125rem;
  }

  h6 {
    font-size: .875rem;
    letter-spacing: -.005625rem;
  }

  h2, h3, h4, h5, h6 {
    font-weight: 700;
  }

  p {
    margin: 1rem 0;
    font-size: 1em;
    line-height: 1.625em;
    letter-spacing: -.005625rem;
    font-weight: 400;
    color: inherit;
  }

  small {
    font-size: smaller;
  }

  em {
    font-style: italic;
  }
`;
