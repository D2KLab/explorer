import styled from 'styled-components';
import PropTypes from 'prop-types';

import Select from '@components/Select';

/**
 * Select input with support for multiple items.
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

const defaultRenderSelectedOption = (item) => item.label;

function MultiSelect({
  className,
  inputId,
  name,
  options,
  placeholder,
  value,
  onChange,
  renderSelectedOption = defaultRenderSelectedOption,
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
    <Container className={className} {...props}>
      <Select
        isClearable={false}
        isMulti={false}
        controlShouldRenderValue={false}
        inputId={inputId}
        name={name}
        options={options}
        onChange={onSelectChange}
        value={values[values.length - 1]}
        placeholder={placeholder}
      />
      <ul className="selected-options">
        {values.length > 0 &&
          values.map((item) => (
            <li key={item.value}>
              <CrossButton onClick={() => removeItem(item)} />
              <span>{renderSelectedOption(item)}</span>
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
