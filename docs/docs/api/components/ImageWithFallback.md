# ImageWithFallback

Display an image, with a fallback image if the first one fails to load.

## Props

* `src = {string}`
* `fallbackSrc = {string}`

## Example with code

```jsx
// highlight-start
import ImageWithFallback from '@components/ImageWithFallback';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <ImageWithFallback src="https://d2klab.github.io/explorer/image.png" fallbackSrc="https://d2klab.github.io/explorer/fallback.png" />
    // highlight-end
  );
};
```
