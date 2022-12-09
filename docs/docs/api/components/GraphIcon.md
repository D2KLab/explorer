# GraphIcon

Displays a graph icon, given a graph URI. The icon has to be set in config.js.

## Props

* `size = {number | default: 24}`
  * Icon size.
* `uri = {string}`
  * Graph URI.

## Example with code

```jsx
// highlight-start
import GraphIcon from '@components/GraphIcon';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <GraphIcon uri="http://dbpedia.org" size={16} />
    // highlight-end
  );
};
```
