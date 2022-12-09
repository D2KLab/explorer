# MultiSelect

Select input with support for multiple items. Based on [react-select](https://react-select.com/).

If you need to handle single values instead, you can use the [Select](Select) component.

## Props

* `inputId = {string}`
* `name = {string}`
* `options = {object[]}`
* `placeholder = {string}`
* `value = {object}`
* `onChange = {function}`
* `renderSelectedOption = {function | default: (item) => item.label}`
* `selectedOptionsStyle = {object}`
* Any props from [react-select](https://react-select.com/).

## Example with code

```jsx
// highlight-start
import MultiSelect from '@components/MultiSelect';
// highlight-end

const MyComponent = () => {
  const options = [{
    label: 'Option 1',
    value: 'first',
  }, {
    label: 'Option 2',
    value: 'second',
  }, {
    label: 'Option 3',
    value: 'third',
  }];

  const handleInputChange = (value, { name }) => {
    console.log(name, value);
  };

  return (
    // highlight-start
    <MultiSelect
      inputId="my_select"
      instanceId="my_select"
      options={options}
      placeholder="Select an option"
      onChange={handleInputChange}
      isClearable
    />
    // highlight-end
  );
};
```
