import { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Switch from 'react-switch';

import Select from '@components/Select';
import MultiSelect from '@components/MultiSelect';
import breakpoints from '@styles/breakpoints';
import Button from '@components/Button';
import Input from '@components/Input';
import useDebounce from '@helpers/useDebounce';
import useDidMountEffect from '@helpers/useDidMountEffect';
import { useTranslation } from 'next-i18next';
import config from '~/config';

const getValue = (opts, val) => opts.find((o) => o.value === val);

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

  ${({ theme }) => theme?.components?.Sidebar?.Container};
`;

const StyledSwitch = styled(Switch)`
  margin-left: 5px;

  ${({ theme }) => theme?.components?.Sidebar?.StyledSwitch};
`;

const ButtonsBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;

  ${({ theme }) => theme?.components?.Sidebar?.ButtonsBar};
`;

const MobileButtonsBar = styled(ButtonsBar)`
  ${breakpoints.mobile`
    display: none;
  `}

  ${({ theme }) => theme?.components?.Sidebar?.MobileButtonsBar};
`;

const ClearButton = styled(Button)`
  background-color: #a6a6a6;
  color: #000;
  flex: 0 1 120px;
  justify-content: center;

  ${({ theme }) => theme?.components?.Sidebar?.ClearButton};
`;

const FilterButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  flex: 0 1 120px;
  justify-content: center;

  ${({ theme }) => theme?.components?.Sidebar?.FilterButton};
`;

const Fields = styled.div`
  ${({ theme }) => theme?.components?.Sidebar?.Fields};
`;

const Field = styled.div`
  margin-bottom: 24px;

  label {
    color: ${({ theme }) => theme.colors.secondary};
    display: block;
    margin-bottom: 8px;
  }

  ${Input} {
    width: 100%;
  }

  ${({ theme }) => theme?.components?.Sidebar?.Field};
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;

  > span {
    flex: 1;
  }

  ${({ theme }) => theme?.components?.Sidebar?.Option};
`;

function Sidebar({ className, onSearch, submitOnChange = false, type, filters, query }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['project', 'search']);

  const [languages] = useState(
    Object.entries(config.search.languages).map(([langKey, langLabel]) => ({
      label: langLabel,
      value: langKey,
    }))
  );
  const [graphOptions] = useState(
    Object.entries(config.graphs).map(([graphURI, graphObj]) => ({
      value: graphURI,
      label: graphObj.label,
    }))
  );

  // Generate initial fields
  const initialFields = {
    q: '', // Set `q` to an empty string to let React know that this is a controlled input (https://reactjs.org/docs/forms.html#controlled-components)
  };

  // Page
  if (typeof query.page !== 'undefined') {
    initialFields.page = query.page;
  }

  // Text search
  if (typeof query.q !== 'undefined') {
    initialFields.q = query.q;
  }

  // Graph search
  if (typeof query.graph !== 'undefined') {
    initialFields.graph = query.graph;
  }

  // Languages
  if (initialFields.field_languages) {
    initialFields.field_languages = Array.isArray(initialFields.field_languages)
      ? initialFields.field_languages
      : [initialFields.field_languages];
    initialFields.field_languages = initialFields.field_languages
      .map((val) => getValue(languages, val))
      .filter((v) => v);
  }

  // Default values for filters
  filters.forEach((filter) => {
    if (typeof filter.defaultValue !== 'undefined' && filter.defaultValue !== null) {
      if (typeof filter.defaultValue === 'boolean') {
        initialFields[`field_filter_${filter.id}`] = filter.defaultValue ? 1 : 0;
      } else {
        initialFields[`field_filter_${filter.id}`] = filter.defaultValue;
      }
    }
  });

  // Props Filters
  Object.keys(query).forEach((key) => {
    const filter = filters.find((f) => key === `field_filter_${f.id}`);
    if (filter) {
      if (filter.isMulti) {
        initialFields[key] = Array.isArray(query[key]) ? query[key] : [query[key]];
        initialFields[key] = initialFields[key]
          .map((val) => getValue(filter.values, val))
          .filter((v) => v);
      } else if (filter.isOption) {
        initialFields[key] = !!parseInt(query[key], 10);
      } else {
        initialFields[key] = query[key];
      }
    }
  });

  const [fields, setFields] = useState(initialFields);

  const handleInputChange = (event, meta) => {
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
      if (target.type === 'checkbox') {
        fieldValue = target.checked ? 1 : 0;
      } else {
        fieldValue = target.value;
      }
    }

    setFields((prevFields) => {
      // If field has multiple values but not enough for condition, remove condition
      if (Array.isArray(fieldValue) && fieldValue.length < 2) {
        const filterId = fieldName.substr('field_'.length);
        delete prevFields[`cond_${filterId}`];
      }
      return {
        ...prevFields,
        [fieldName]: fieldValue,
      };
    });
  };

  const handleSwitchChange = (checked, event, id) => {
    setFields((prevFields) => ({
      ...prevFields,
      [id]: checked ? 1 : 0,
    }));
  };

  const doSearch = () => {
    if (typeof onSearch === 'function') {
      const searchFields = {};
      Object.entries(fields).forEach(([key, val]) => {
        if (typeof val === 'undefined' || val === null || val === '') {
          delete searchFields[key];
        } else if (typeof val === 'boolean') {
          searchFields[key] = val ? 1 : 0;
        } else if (val.value) {
          searchFields[key] = val.value;
        } else if (Array.isArray(val)) {
          searchFields[key] = val.map((v) => v.value || v);
        } else {
          searchFields[key] = val;
        }
      });

      onSearch(searchFields);
    }
  };

  const clearSearch = () => {
    setFields({
      q: '',
    });
  };

  const renderSelectedOption = (item) => (
    <>
      {item.label}{' '}
      {config.plugins.skosmos && (
        <small>
          {' '}
          (
          <a
            href={`${config.plugins.skosmos.baseUrl}${item.value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            def
          </a>
          )
        </small>
      )}
    </>
  );

  const renderFilter = (filter) => {
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
        <label htmlFor="field_filter">{t(`project:filters.${filter.id}`, filter.label)}</label>
        <FilterInput
          id={`field_filter_${filter.id}`}
          inputId={`field_filter_${filter.id}`}
          instanceId={`field_filter_${filter.id}`}
          name={`field_filter_${filter.id}`}
          options={filter.values}
          value={value}
          placeholder={t('search:labels.select')}
          onChange={handleInputChange}
          renderSelectedOption={
            typeof filter.vocabulary !== 'undefined' ? renderSelectedOption : undefined
          }
          props={{
            isClearable: true,
            filterOption: (option, rawInput) => {
              const inputValue = rawInput.toLocaleLowerCase();
              const { label } = option;
              const { altLabel } = option.data;
              return (
                label.toLocaleString().toLocaleLowerCase().includes(inputValue) ||
                altLabel?.toLocaleString().toLocaleLowerCase().includes(inputValue)
              );
            },
          }}
        />
        {filter.condition === 'user-defined' && fields[`field_filter_${filter.id}`]?.length > 1 && (
          <div style={{ maxWidth: 100, marginLeft: '2em' }}>
            <Select
              id={`cond_filter_${filter.id}`}
              inputId={`cond_filter_${filter.id}`}
              instanceId={`cond_filter_${filter.id}`}
              name={`cond_filter_${filter.id}`}
              options={conditionOptions}
              value={conditionOptions.find((o) => o.value === fields[`cond_filter_${filter.id}`])}
              defaultValue={conditionOptions[0]}
              onChange={handleInputChange}
            />
          </div>
        )}
      </Field>
    );
  };

  const renderOption = (filter) => (
    <Option key={filter.id}>
      <span>{t(`project:filters.${filter.id}`, filter.label)}</span>
      <StyledSwitch
        onChange={handleSwitchChange}
        checked={!!fields[`field_filter_${filter.id}`]}
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

  // Execute search when fields change
  const debouncedFields = useDebounce(fields, 500);
  useDidMountEffect(() => {
    if (submitOnChange) {
      doSearch();
    }
  }, [debouncedFields]);

  const route = config.routes[type];

  const conditionOptions = [
    {
      value: 'or',
      label: t('common:sidebar.condition.or'),
    },
    {
      value: 'and',
      label: t('common:sidebar.condition.and'),
    },
  ];

  return (
    <Container className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSearch();
          return false;
        }}
      >
        <ButtonsBar>
          <ClearButton onClick={clearSearch}>{t('search:buttons.clear')}</ClearButton>
          <FilterButton type="submit" onClick={doSearch}>
            {t('search:buttons.filter')}
          </FilterButton>
        </ButtonsBar>

        <Fields>
          <Field>
            <label htmlFor="q">{t('search:fields.q')}</label>
            <Input id="q" name="q" type="text" value={fields.q} onChange={handleInputChange} />
          </Field>
          {/* <Field>
            <label htmlFor="field_languages">{t('search:fields.languages')}</label>
            <MultiSelect
              inputId="field_languages"
              name="field_languages"
              options={languages}
              value={languages.find(o => o.value === fields.field_languages)}
              onChange={this.handleInputChange}
            />
          </Field> */}
          {filters.filter((filter) => !filter.isOption).map(renderFilter)}
          {route.filterByGraph && (
            <Field>
              <label htmlFor="graph">
                {(config.search.graphFieldLabel && config.search.graphFieldLabel[i18n.language]) ||
                  t('search:fields.graph')}
              </label>
              <Select
                id="graph"
                inputId="graph"
                instanceId="graph"
                name="graph"
                options={graphOptions}
                value={graphOptions.find((o) => o.value === fields.graph)}
                onChange={handleInputChange}
                placeholder={t('search:labels.select')}
                isClearable
              />
            </Field>
          )}
          {filters.some((filter) => filter.isOption) ? (
            <Field>
              <label>{t('search:fields.options')}</label>
              {filters.filter((filter) => filter.isOption).map(renderOption)}
            </Field>
          ) : null}
        </Fields>

        <MobileButtonsBar>
          <ClearButton onClick={clearSearch}>{t('search:buttons.clear')}</ClearButton>
          <FilterButton type="submit" onClick={doSearch}>
            {t('search:buttons.filter')}
          </FilterButton>
        </MobileButtonsBar>
      </form>
    </Container>
  );
}

export default Sidebar;
