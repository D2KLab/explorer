# Element

Container which extends [styled-system](https://styled-system.com/) and can be used for styling.

## Props

* Any props from [styled-system](https://styled-system.com/).

## Example with code

```jsx
// highlight-start
import Element from '@components/Element';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <Element display="flex" justifyContent="center" marginY={12}>
      Your content
    </Element>
    // highlight-end
  );
};
```
