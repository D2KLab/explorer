import { Component } from 'react';
import styled, { withTheme } from 'styled-components';
import Switch from 'react-switch';

import Select from '@components/Select';
import MultiSelect from '@components/MultiSelect';
import { breakpoints } from '@styles';
import Button from '@components/Button';
import Input from '@components/Input';

import { withTranslation } from '~/i18n';
import config from '~/config';

const Container = styled.div`
  background-color: #d9d9d9;
  display: flex;
  flex-direction: column;
  padding: 16px 32px;

  ${breakpoints.weirdMedium`
    flex: 0 1 350px;
    min-height: calc(
      100vh - ${({ theme }) =>
        `${theme.header.height} - ${theme.header.borderBottomWidth} - ${theme.footer.minHeight}`}
    );
  `}
`;

const StyledSwitch = styled(Switch)`
  margin-left: 5px;
`;

const ButtonsBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const MobileButtonsBar = styled(ButtonsBar)`
  ${breakpoints.mobile`
    display: none;
  `}
`;

const ClearButton = styled(Button)`
  background-color: #a6a6a6;
  color: #000;
  flex: 0 1 120px;
  justify-content: center;
`;

const FilterButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  flex: 0 1 120px;
  justify-content: center;
`;

const Fields = styled.div``;

const Field = styled.div`
  margin-bottom: 24px;

  label {
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 0.9em;
    display: block;
    margin-bottom: 8px;
  }

  ${Input} {
    width: 100%;
  }
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;

  > span {
    flex: 1;
  }
`;

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.handleSwitchChange = this.handleSwitchChange.bind(this);

    const graphOptions = Object.entries(config.graphs).map(([graphURI, graphObj]) => ({
      value: graphURI,
      label: graphObj.label,
    }));

    const getValue = (opts, val) => opts.find((o) => o.value === val);
    const fields = {};

    // Text search
    fields.q = props.query.q || '';

    // Graph search
    fields.graph = props.query.graph || '';

    // Languages
    const languages = Object.entries(config.search.languages).map(([langKey, langLabel]) => ({
      label: langLabel,
      value: langKey,
    }));
    if (fields.field_languages) {
      fields.field_languages = Array.isArray(fields.field_languages)
        ? fields.field_languages
        : [fields.field_languages];
      fields.field_languages = fields.field_languages
        .map((val) => getValue(languages, val))
        .filter((v) => v);
    }

    // Props Filters
    Object.keys(props.query).forEach((key) => {
      const filter = props.filters.find((f) => key === `field_filter_${f.id}`);
      if (filter) {
        if (filter.isMulti) {
          fields[key] = Array.isArray(props.query[key]) ? props.query[key] : [props.query[key]];
          fields[key] = fields[key].map((val) => getValue(filter.values, val)).filter((v) => v);
        } else {
          fields[key] = props.query[key];
        }
      }
    });

    this.state = {
      fields,
      languages,
      graphOptions,
    };
  }

  handleInputChange = (event, meta) => {
    let fieldName;
    let fieldValue;
    if (meta) {
      // react-select doesn't return the same parameters as other inputs
      // the first parameter "event" contains the selected label/value
      // the second parameter "meta" contains the input name
      fieldName = meta.name;
      fieldValue = event;
    } else {
      const { target } = event;
      fieldName = target.name;
      fieldValue = target.type === 'checkbox' ? target.checked : target.value;
    }
    this.setState((prevState) => ({
      fields: {
        ...prevState.fields,
        [fieldName]: fieldValue,
      },
    }));
  };

  handleSwitchChange = (checked, event, id) => {
    this.setState((prevState) => ({
      fields: {
        ...prevState.fields,
        [id]: checked,
      },
    }));
  };

  clearSearch = () => {
    const fields = {};
    fields.q = '';
    fields.graph = '';
    Object.keys(this.state.fields).forEach((f) => {
      if (Array.isArray(this.state.fields[f])) {
        fields[f] = [];
      } else if (typeof this.state.fields[f] === 'object') {
        fields[f] = {};
      } else {
        fields[f] = '';
      }
    });
    this.setState(
      {
        fields,
      },
      this.doSearch
    );
  };

  doSearch = () => {
    const { onSearch } = this.props;
    if (typeof onSearch === 'function') {
      const fields = {};
      Object.entries(this.state.fields).forEach(([key, val]) => {
        if (val.value) {
          fields[key] = val.value;
        } else if (Array.isArray(val)) {
          fields[key] = val.map((v) => v.value || v);
        } else {
          fields[key] = val;
        }
      });
      onSearch(fields);
    }
  };

  renderFilter = (filter) => {
    const { t } = this.props;
    const { fields } = this.state;

    const field = fields[`field_filter_${filter.id}`];
    const FilterInput = filter.isMulti ? MultiSelect : Select;

    let value = null;
    if (filter.isMulti) {
      value = field || null;
    } else {
      value =
        filter.values.find((v) => {
          if (typeof v.value === 'undefined' || !field) {
            return false;
          }

          if (Array.isArray(field)) {
            return field.find((f) => f === v.value || f.value === v.value);
          }

          if (field.value) {
            return field.value === v.value;
          }

          return field === v.value;
        }) || null;
    }

    return (
      <Field key={filter.id}>
        <label htmlFor="field_filter">{t(`filters.${filter.id}`, filter.label)}</label>
        <FilterInput
          inputId={`field_filter_${filter.id}`}
          name={`field_filter_${filter.id}`}
          options={filter.values}
          value={value}
          placeholder={t('search:labels.select')}
          onChange={this.handleInputChange}
        />
      </Field>
    );
  };

  renderOption = (filter) => {
    const { fields } = this.state;
    const { theme, t } = this.props;

    return (
      <Option key={filter.id}>
        <span>{t(`filters.${filter.id}`, filter.label)}</span>
        <StyledSwitch
          onChange={this.handleSwitchChange}
          checked={fields[`field_filter_${filter.id}`] || false}
          onColor={theme.colors.light}
          offHandleColor="#f0f0f0"
          onHandleColor={theme.colors.primary}
          handleDiameter={24}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={16}
          width={36}
          id={`field_filter_${filter.id}`}
        />
      </Option>
    );
  };

  render() {
    const { className, type, filters, t, i18n } = this.props;
    const { fields, languages, graphOptions } = this.state;

    const route = config.routes[type];

    return (
      <Container className={className}>
        <ButtonsBar>
          <ClearButton onClick={this.clearSearch}>{t('search:buttons.clear')}</ClearButton>
          <FilterButton onClick={this.doSearch}>{t('search:buttons.filter')}</FilterButton>
        </ButtonsBar>

        <form>
          <Fields>
            <Field>
              <label htmlFor="q">{t('search:fields.q')}</label>
              <Input
                id="q"
                name="q"
                type="text"
                value={fields.q}
                onChange={this.handleInputChange}
              />
            </Field>
            {/* <Field>
              <label htmlFor="field_languages">{t('search:fields.languages')}</label>
              <MultiSelect
                id="field_languages"
                name="field_languages"
                options={languages}
                value={languages.find(o => o.value === fields.field_languages)}
                onChange={this.handleInputChange}
              />
            </Field> */}
            {filters.filter((filter) => !filter.isOption).map(this.renderFilter)}
            {route.filterByGraph && (
              <Field>
                <label htmlFor="graph">
                  {config.search.graphFieldLabel[i18n.language] || t('search:fields.graph')}
                </label>
                <Select
                  inputId="graph"
                  name="graph"
                  options={graphOptions}
                  value={graphOptions.find((o) => o.value === fields.graph)}
                  onChange={this.handleInputChange}
                  placeholder={t('search:labels.select')}
                />
              </Field>
            )}
            {filters.some((filter) => filter.isOption) ? (
              <Field>
                <label>{t('search:fields.options')}</label>
                {filters.filter((filter) => filter.isOption).map(this.renderOption)}
              </Field>
            ) : null}
          </Fields>
        </form>

        <MobileButtonsBar>
          <ClearButton onClick={this.clearSearch}>{t('search:buttons.clear')}</ClearButton>
          <FilterButton onClick={this.doSearch}>{t('search:buttons.filter')}</FilterButton>
        </MobileButtonsBar>
      </Container>
    );
  }
}

export default withTranslation(['common', 'search'])(withTheme(Sidebar));
