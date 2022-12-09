# Debug

Debug container. Only visible if [debug](/api/config#debug) is set to `true` in config.js.

## Props

* `children = {React.ReactNode}`
  * React children prop

## Example with code

```jsx
// highlight-start
import Debug from '@components/Debug';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <Debug>
      This content will only appear in debug mode.
    </Debug>
    // highlight-end
  );
};
```
