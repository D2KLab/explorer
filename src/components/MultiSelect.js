import styled from 'styled-components';
import PropTypes from 'prop-types';

import Select from '@components/Select';

/**
 * A simple SVG icon that displays a cross.
 * @param {object} props - the props to pass to the SVG component
 * @returns {JSX.Element} - the SVG component
 */
function CrossIcon(props) {
  return (
    <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" {...props}>
      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
    </svg>
  );
}

const CrossButton = styled(CrossIcon)`
  display: inline-block;
  fill: currentColor;
  line-height: 1;
  stroke: currentColor;
  stroke-width: 0;
  cursor: pointer;
  border-radius: 100%;
  background-color: #ccc;
  color: #fff;
  margin-right: 8px;
`;

const Container = styled.div`
  li {
    display: flex;
    align-items: center;
    margin: 8px 0;
    padding: 0.3em;
    cursor: default;
    transition: background-color 0.1s linear;

    &:hover {
      background-color: #dcdcdc;
    }
  }
`;

const Label = styled.span`
  flex: 1;
`;

// Render the selected option for the dropdown list.
const defaultRenderSelectedOption = (item) => item.label;

/**
 * A component that allows the user to select multiple options from a list.
 * @param {string} className - The class name to apply to the component.
 * @param {string} inputId - The id of the input element.
 * @param {string} name - The name of the input element.
 * @param {string} placeholder - The placeholder text to display in the input element.
 * @param {string[]} options - The options to display in the dropdown.
 * @param {string[]} value - The values of the options that are selected.
 * @param {Function} onChange - A function to call when the user selects or removes an item.
 */
function MultiSelect({
  className,
  inputId,
  name,
  options,
  placeholder,
  value,
  onChange,
  renderSelectedOption = defaultRenderSelectedOption,
  selectedOptionsStyle,
  ...props
}) {
  const triggerOnChange = (values) => {
    if (typeof onChange === 'function') {
      const meta = {
        name,
      };
      onChange(values, meta);
    }
  };

  const getValues = () => (Array.isArray(value) ? value : [value].filter((x) => x));

  const onSelectChange = (newValue /* meta */) => {
    const values = getValues();
    const newValues = Array.isArray(newValue) ? newValue : [newValue].filter((x) => x);
    values.push(...newValues);
    const uniqueValues = Array.from(new Set(values));
    triggerOnChange(uniqueValues);
  };

  const removeItem = (item) => {
    const values = getValues().filter((v) => v.value !== item.value);
    triggerOnChange(values);
  };

  const values = getValues();

  return (
    <Container className={className}>
      <Select
        id={inputId}
        inputId={inputId}
        instanceId={inputId}
        isClearable={false}
        isMulti={false}
        controlShouldRenderValue={false}
        name={name}
        options={options}
        onChange={onSelectChange}
        value={values[values.length - 1]}
        placeholder={placeholder}
        {...props}
      />
      <ul style={selectedOptionsStyle}>
        {values.length > 0 &&
          values.map((item) => (
            <li key={item.value}>
              <CrossButton onClick={() => removeItem(item)} />
              <Label>{renderSelectedOption(item)}</Label>
            </li>
          ))}
      </ul>
    </Container>
  );
}

MultiSelect.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

MultiSelect.defaultProps = {
  id: '',
  name: '',
  placeholder: '',
};

export default MultiSelect;
