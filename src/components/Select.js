import ReactSelect from 'react-select';

const customStyles = {
  control: (provided) => ({
    ...provided,
    border: 'none',
    borderBottom: '2px solid #000',
    backgroundColor: '#f0f0f0',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'hsl(0,0%,20%)',
    '&:hover': {
      color: 'hsl(0,0%,20%)',
    },
  }),
  option: (base) => ({
    ...base,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
};

const customTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary: '#000',
    neutral0: '#ccc',
    primary25: '#bbb',
  },
});

/**
 * A custom ReactSelect component that uses the custom theme and styles.
 * @param {object} props - the props to pass to the Select component.
 * @returns A ReactSelect component with the custom theme and styles.
 */
function Select({ ...props }) {
  return <ReactSelect styles={customStyles} theme={customTheme} {...props} />;
}

export default Select;
