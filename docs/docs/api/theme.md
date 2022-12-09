---
sidebar_position: 1
---

# `theme.js`

:::note

This page is a draft and some informations might be missing.

:::

<details>
<summary>Full example of <code>theme.js</code></summary>

```js
const theme = {
  fontFamily: {
    sansSerif:
      'Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    mono: 'Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace',
  },
  colors: {
    text: '#333',
    background: '#f7f7ef',
    primary: '#2b4253',
    secondary: '#144168',
    linkHover: '#a02a0c',
    light: '#f5b1a1',
  },
  home: {
    textSearchButton: {
      background: '#61b791',
      text: '#fff',
    },
    imageSearchButton: {
      background: '#61b791',
      text: '#fff',
    },
  },
  header: {
    height: '80px',
    borderBottomWidth: '1px',
  },
  footer: {
    minHeight: '150px',
  },
};

export default theme;
```

</details>
