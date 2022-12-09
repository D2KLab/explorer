# ScrollDetector

Scroll detector.

## Props

* `onAppears = {function}`
* `rootMargin = {string}`

## Example with code

```jsx
// highlight-start
import ScrollDetector from '@components/ScrollDetector';
// highlight-end

const MyComponent = () => {
  const onAppears = () => {
    console.log('Appeared!');
  };

  return (
    // highlight-start
    <ScrollDetector
      onAppears={onAppears}
      rootMargin="0px 0px -50% 0px"
    />
    // highlight-end
  );
};
```
