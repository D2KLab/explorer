import ReactSelect from 'react-select';

const customStyles = {
  control: provided => ({
    ...provided,
    border: 'none',
    borderBottom: '2px solid #000'
  })
};

const customTheme = theme => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary: '#000',
    neutral0: '#ccc',
    primary25: '#bbb'
  }
});

const Select = ({ ...props }) => (
  <ReactSelect styles={customStyles} theme={customTheme} {...props} />
);

export default Select;
