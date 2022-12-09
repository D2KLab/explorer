# GraphLink

Displays a graph link, given a graph URI. The url has to be set in config.js.

## Props

* `target = {string | default: "_blank"}`
  * Anchor [target](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target) attribute.
* `rel = {string | default: "noopener noreferrer"}`
  * Anchor [rel](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-rel) attribute.
* `uri = {string}`
  * Graph URI.
* `icon = {boolean}`
  Display icon if set to `true`.
* `label = {boolean}`
  * Display label if set to `true`.

## Example with code

```jsx
// highlight-start
import GraphLink from '@components/GraphLink';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <GraphLink uri="http://dbpedia.org" icon label />
    // highlight-end
  );
};
```
