# MetadataList

Metadata list.

## Props

* `metadata = {object}`
* `type = {string}`

## Example with code

```jsx
// highlight-start
import MetadataList from '@components/MetadataList';
// highlight-end

const MyComponent = () => {
  const data = {
    label: 'France',
    population: '67.5 million',
  };

  return (
    // highlight-start
    <MetadataList metadata={data} type="countries" />
    // highlight-end
  );
};
```
