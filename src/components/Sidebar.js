import { Component } from 'react';
import styled from 'styled-components';
import Select from '@components/Select';
import MultiSelect from '@components/MultiSelect';
import { breakpoints } from '@styles';

import { withTranslation, i18n } from '~/i18n';
import config from '~/config';

const Container = styled.div`
  background-color: #eee;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px 32px;

  ${breakpoints.weirdMedium`
    max-width: 350px;
    min-height: calc(
      100vh - ${({ theme }) =>
        `${theme.header.height} - ${theme.header.borderBottomWidth} - ${theme.footer.minHeight}`}
    );
  `}
`;

const ButtonsBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Button = styled.button`
  font-size: 1rem;
  flex: 0 1 100px;
  padding: 0.5em;
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
      0px 2px 1px -1px rgba(0, 0, 0, 0.12);
  }
`;

const ClearButton = styled(Button)`
  background-color: #ccc;
  color: #000;
`;

const FilterButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
`;

const Fields = styled.div``;

const Field = styled.div`
  margin-bottom: 24px;

  label {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.9em;
    display: block;
    margin-bottom: 8px;
  }

  > input,
  label > input {
    background-color: #ccc;
    border-style: solid;
    border-color: #000;
    border-width: 0;
    border-bottom-width: 2px;
    border-radius: 0;
    outline: 0;
    box-sizing: border-box;
    width: 100%;
    font-size: 1rem;
    min-height: 38px;
    padding: 0 8px;

    &:focus {
      box-shadow: 0 0 1 #ccc;
      border-width: 2px;
    }
  }
`;

class Sidebar extends Component {
  constructor(props) {
    super(props);

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
      graphOptions
    };
  }

  handleInputChange = (event, meta) => {
    if (meta) {
      // react-select doesn't return the same parameters as other inputs
      // the first parameter "event" contains the selected label/value
      // the second parameter "meta" contains the input name
      this.setState({
        fields: {
          ...this.state.fields,
          [meta.name]: event,
        },
      });
    } else {
      const { target } = event;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.setState({
        fields: {
          ...this.state.fields,
          [target.name]: value,
        },
      });
    }
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

  render() {
    const { className, type, filters, t, req } = this.props;
    const { fields, languages, graphOptions } = this.state;

    const route = config.routes[type];
    const currentLanguage = req ? req.language : i18n.language;

    return (
      <Container className={className}>
        <ButtonsBar>
          <ClearButton>{t('buttons.clear')}</ClearButton>
          <FilterButton onClick={this.doSearch}>{t('buttons.filter')}</FilterButton>
        </ButtonsBar>

        <form>
          <Fields>
            {route.filterByGraph && (
              <Field>
                <label htmlFor="graph">
                  {config.search.graphFieldLabel[currentLanguage] || t('fields.graph')}
                </label>
                <Select
                  inputId="graph"
                  name="graph"
                  options={graphOptions}
                  value={fields.graph}
                  onChange={this.handleInputChange}
                />
              </Field>
            )}
            <Field>
              <label htmlFor="q">{t('fields.q')}</label>
              <input
                id="q"
                name="q"
                type="text"
                value={fields.q}
                onChange={this.handleInputChange}
              />
            </Field>
            {/* <Field>
              <label htmlFor="field_languages">{t('fields.languages')}</label>
              <MultiSelect
                id="field_languages"
                name="field_languages"
                options={languages}
                value={fields.field_languages}
                onChange={this.handleInputChange}
              />
            </Field> */}
            {filters.map((filter) => {
              const field = fields[`field_filter_${filter.id}`];
              const FilterInput = filter.isMulti ? MultiSelect : Select;
              return (
                <Field key={filter.label}>
                  <label htmlFor="field_filter">{t(`fields.${filter.id}`, filter.label)}</label>
                  <FilterInput
                    inputId={`field_filter_${filter.id}`}
                    name={`field_filter_${filter.id}`}
                    options={filter.values}
                    value={filter.values.find((v) => {
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
                    })}
                    onChange={this.handleInputChange}
                  />
                </Field>
              );
            })}
          </Fields>
        </form>
      </Container>
    );
  }
}

export default withTranslation('search')(Sidebar);
