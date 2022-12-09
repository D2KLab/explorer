# ToggleSwitch

## Props

* `name = {string}`
  * Input name.
* `options = {object[]}`
* `defaultOption = {object}`
* `onChange = {function}`
  * Function triggered when the value is changed. Takes two parameters: `value` and `event` which has a property `name` (input name).

## Example with code

```jsx
// highlight-start
import ToggleSwitch from '@components/ToggleSwitch';
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
    <ToggleSwitch
      name="my_switch"
      options={options}
      onChange={handleInputChange}
    />
    // highlight-end
  );
};
```
