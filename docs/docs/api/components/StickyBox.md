# StickyBox

Sticky box. Based on [react-sticky-box](https://github.com/codecks-io/react-sticky-box).

## Props

* `bottom = {boolean | default: false}`
  * If `true`, content will stick to the bottom of viewport, note that you also need to make sure that the css is set up correctly. The container should use e.g `display: flex; align-items: flex-end;`.
* `offsetTop = {number | default: 0}`
  * Defines the offset to the top of the viewport in pixels.
* `offsetBottom = {number | default: 0}`
  * Defines the offset to the bottom of the viewport in pixels.

## Example with code

```jsx
// highlight-start
import StickyBox from '@components/StickyBox  ';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <StickyBox offsetTop={20} offsetBottom={20} />
    // highlight-end
  );
};
```
