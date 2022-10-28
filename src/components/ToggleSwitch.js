import { useEffect, useState, useRef, createRef } from 'react';
import styled, { css } from 'styled-components';

const Switch = styled.div`
  position: relative;
  width: 100%;
  background-color: #fff;
  border: 1px solid #333;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SwitchRadio = styled.input`
  display: none;
`;

const SwitchSelection = styled.span`
  display: block;
  height: 100%;
  position: absolute;
  top: 0;
  background: ${({ theme }) => theme.colors.primary};
  ${({ active }) =>
    active
      ? css`
          transition: left 150ms ease-out, width 150ms ease-out;
        `
      : ''};
`;

const SwitchItem = styled.div`
  flex: 1 1 auto;
  z-index: 1;
  min-height: 38px;
  display: flex;
  align-items: center;

  &:not(:last-of-type) {
    border-right: 1px solid black;
  }
`;

const SwitchLabel = styled.label`
  position: relative;
  padding: 0 1em;
  float: left;
  text-align: center;
  cursor: pointer;
  width: 100%;

  ${SwitchRadio}:checked + & {
    transition: 150ms ease-in-out;
  }
`;

const ClickableLabel = ({ title, value, onChange }) => (
  <SwitchLabel onClick={(event) => onChange(value, event)}>{title}</SwitchLabel>
);

const ConcealedRadio = ({ value, selected }) => (
  <SwitchRadio type="radio" name="switch" checked={selected === value} />
);

function ToggleSwitch({ name, options, defaultOption, onChange }) {
  const [selected, setSelected] = useState();
  const [left, setLeft] = useState();
  const [width, setWidth] = useState(-1);

  const handleChange = (val, event) => {
    setSelected(val);
    if (typeof onChange === 'function') {
      onChange(val, { name, event });
    }
  };

  useEffect(() => {
    setSelected(defaultOption?.value);
  }, [defaultOption]);

  useEffect(() => {
    const el = lineRefs.current[options.findIndex((option) => option.value === selected)]?.current;

    if (el) {
      const { offsetLeft, offsetWidth } = el;
      setLeft(offsetLeft);
      setWidth(offsetWidth);
    }
  }, [selected]);

  const lineRefs = useRef([]);
  lineRefs.current = options.map((_, i) => lineRefs.current[i] ?? createRef());

  return (
    <Switch>
      {options.map((option, i) => {
        return (
          <SwitchItem key={option.value} ref={lineRefs.current[i]}>
            <ClickableLabel title={option.label} value={option.value} onChange={handleChange}>
              <ConcealedRadio value={option.value} selected={selected} />
            </ClickableLabel>
          </SwitchItem>
        );
      })}
      <SwitchSelection style={{ left, width }} active={width > -1} />
    </Switch>
  );
}

export default ToggleSwitch;