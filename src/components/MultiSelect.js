import { Component } from 'react';
import styled from 'styled-components';
import Select from '@components/Select';
import PropTypes from 'prop-types';

/**
 * Select input with support for multiple items.
 */

const CrossIcon = (props) => (
  <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" {...props}>
    <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
  </svg>
);

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

export default class MultiSelect extends Component {
  onSelectChange = (value, meta) => {
    const values = this.getValues();
    const newValues = Array.isArray(value) ? value : [value].filter(x => x);
    values.push(...newValues);
    this.triggerOnChange(values);
  };

  getValues = () => {
    return Array.isArray(this.props.value) ? this.props.value : [this.props.value].filter((x) => x);
  }

  removeItem = (item) => {
    const values = this.getValues().filter(v => v.value !== item.value);
    this.triggerOnChange(values);
  }

  triggerOnChange(values) {
    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      const meta = {
        name: this.props.name,
      };
      onChange(values, meta);
    }
  }

  render() {
    const { className, id, name, options } = this.props;

    const values = this.getValues();

    return (
      <Container className={className}>
        <div>
          <Select
            isMulti={false}
            controlShouldRenderValue={false}
            inputId={id}
            name={name}
            options={options}
            onChange={this.onSelectChange}
            value={values[values.length - 1]}
          />
        </div>
        <ul className="selected-options">
          {values.length > 0 &&
            values.map((item) => (
              <li key={item.value}>
                <CrossButton onClick={() => this.removeItem(item)} />
                <span>{item.label}</span>
              </li>
            ))}
        </ul>
      </Container>
    );
  }
}

MultiSelect.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
};

MultiSelect.defaultProps = {
  id: '',
  name: '',
};
