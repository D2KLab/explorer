import { useEffect, useState, useRef, createRef } from 'react';
import styled from 'styled-components';

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
  const [selected, setSelected] = useState(defaultOption?.value);
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);

  const handleChange = (val, event) => {
    const { offsetLeft, offsetWidth } = event.target;
    setLeft(offsetLeft);
    setWidth(offsetWidth);
    setSelected(val);
    if (typeof onChange === 'function') {
      onChange(val, { name, event });
    }
  };

  const lineRefs = useRef([]);
  lineRefs.current = options.map((_, i) => lineRefs.current[i] ?? createRef());

  useEffect(() => {
    const defaultEl =
      lineRefs.current[options.findIndex((option) => option.value === defaultOption?.value)]
        ?.current;

    if (defaultEl) {
      const { offsetLeft, offsetWidth } = defaultEl;
      setLeft(offsetLeft);
      setWidth(offsetWidth);
      setSelected(defaultOption?.value);
    }
  }, []);

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
      <SwitchSelection style={{ left, width }} />
    </Switch>
  );
}

export default ToggleSwitch;
