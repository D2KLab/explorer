# Metadata

Metadata with label and value(s).

## Props

* `label = {string}`
* `labelStyle = {object}`
* `valueStyle = {object}`
* `children = {React.ReactNode}`
  * React children prop

## Example with code

```jsx
// highlight-start
import Metadata from '@components/Metadata';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <Metadata label="Your label">
      Your values
    </Metadata>
    // highlight-end
  );
};
```
