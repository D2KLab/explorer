# SaveButton

Save button.

## Props

* `type = {string}`
* `item = {object}`
* `saved = {boolean}`
* `size = {number | string}`
* `onChange = {function}`

## Example with code

```jsx
// highlight-start
import SaveButton from '@components/SaveButton';
// highlight-end

const MyComponent = ({ result, inList }) => {
  const onItemSaveChange = (saved) => {
    console.log(saved === true ? 'Saved': 'Unsaved')
  };

  return (
    // highlight-start
    <SaveButton
      type="countries"
      item={result}
      saved={inList}
      onChange={onItemSaveChange}
    />
    // highlight-end
  );
};
```
