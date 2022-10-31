import { useEffect, useState, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import Switch from 'react-switch';
import { useTranslation } from 'next-i18next';

import Select from '@components/Select';
import MultiSelect from '@components/MultiSelect';
import breakpoints from '@styles/breakpoints';
import Button from '@components/Button';
import Input from '@components/Input';
import ToggleSwitch from '@components/ToggleSwitch';
import useDebounce from '@helpers/useDebounce';
import config from '~/config';

const getValue = (opts, val) => opts.find((o) => o.value === val);

const Container = styled.div`
  background-color: #d9d9d9;
  display: flex;
  flex-direction: column;
  padding: 16px 32px;
  width: 100%;

  ${breakpoints.mobile`
    width: 350px;
  `}

  ${breakpoints.weirdMedium`
    min-height: calc(
      100vh - ${({ theme }) =>
        `${theme.header.height} - ${theme.header.borderBottomWidth} - ${theme.footer.minHeight}`}
    );
  `}

  ${({ theme }) => theme?.components?.Sidebar?.Container};
`;

const StyledInput = styled(Input)`
  ${({ theme }) => theme?.components?.Sidebar?.StyledInput};
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
  row-gap: 24px;
  column-gap: 24px;
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
  flex: 1 1 120px;
  justify-content: center;

  ${({ theme }) => theme?.components?.Sidebar?.ClearButton};
`;

const FilterButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  flex: 1 1 120px;
  justify-content: center;

  ${({ theme }) => theme?.components?.Sidebar?.FilterButton};
`;

const Fields = styled.div`
  ${({ theme }) => theme?.components?.Sidebar?.Fields};
`;

const Field = styled.div`
  > label {
    color: ${({ theme }) => theme.colors.secondary};
    display: block;
    margin-top: 24px;
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

const ConditionFilter = styled.div`
  position: relative;
  height: 100%;
  border-left: 2px solid #8256d0;
  display: flex;
  align-items: center;
  color: #8256d0;

  &::before,
  &::after {
    position: absolute;
    content: '';
    display: block;
    left: -12px;
    width: 12px;
    height: 2px;
    background-color: #8256d0;
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
  }

  div {
    width: 32px;
    height: 32px;
    margin-left: -16px;
    background-color: ${({ theme }) =>
      theme?.components?.Sidebar?.Container?.backgroundColor || '#d9d9d9'};
  }

  svg {
    transform: rotate(90deg);
  }

  span {
    user-select: none;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 0.8rem;
  }
`;

ConditionFilter.Container = styled.div`
  position: absolute;
  top: 46px;
  right: 0;
  height: calc(100% - 46px);
  cursor: pointer;
`;

function Sidebar({ className, onSearch, submitOnChange = false, type, filters, query }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['project', 'search']);
  const [fields, setFields] = useState({});
  const [textValue, setTextValue] = useState('');

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

  const isFirstRender = useRef(true);

  useEffect(() => {
    // Generate initial fields
    const initialFields = {
      q: '', // Set `q` to an empty string to let React know that this is a controlled input (https://reactjs.org/docs/forms.html#controlled-components)
    };

    // Text search
    if (typeof query.q !== 'undefined') {
      setTextValue(query.q);
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

        const conditionKey = `cond_filter_${filter.id}`;
        if (query[conditionKey]) {
          initialFields[conditionKey] = query[conditionKey];
        }
      }
    });

    isFirstRender.current = true;
    setFields(initialFields);
  }, [query]);

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

  const debouncedTextValue = useDebounce(textValue, 1000);
  useEffect(() => {
    if (fields.q !== debouncedTextValue) {
      setFields((prev) => ({
        ...prev,
        q: debouncedTextValue,
      }));
    }
  }, [debouncedTextValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    doSearch();
  }, [fields]);

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
    setTextValue('');
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

    let value = null;
    if (filter.isMulti || filter.isToggle) {
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

    if (filter.isToggle) {
      const valueIndex = filter.options.findIndex((option) => option.value === value);
      return (
        <Field key={filter.id} style={filter.style}>
          <div style={{ marginTop: filter.hideLabel ? 0 : 24 }}>
            {!filter.hideLabel && t(`project:filters.${filter.id}`, filter.label)}
            <div style={{ position: 'relative' }}>
              <ToggleSwitch
                name={`field_filter_${filter.id}`}
                options={filter.options}
                defaultOption={
                  filter.options[valueIndex > -1 ? valueIndex : filter.defaultOption ?? 0]
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
        </Field>
      );
    }

    const SelectInput = filter.isMulti ? MultiSelect : Select;

    const hasCondition =
      filter.condition === 'user-defined' && fields[`field_filter_${filter.id}`]?.length > 1;
    const isConditionSet = fields[`cond_filter_${filter.id}`];

    return (
      <Field key={filter.id} style={filter.style}>
        <label style={filter.hideLabel && { marginTop: 0 }}>
          {!filter.hideLabel && t(`project:filters.${filter.id}`, filter.label)}
          {filter.values.length > 0 && (
            <div style={{ position: 'relative' }}>
              <SelectInput
                inputId={`field_filter_${filter.id}`}
                instanceId={`field_filter_${filter.id}`}
                name={`field_filter_${filter.id}`}
                options={filter.values}
                value={value}
                placeholder={t(`project:filters.${filter.placeholder}`, t('search:labels.select'))}
                onChange={handleInputChange}
                renderSelectedOption={
                  typeof filter.vocabulary !== 'undefined' ? renderSelectedOption : undefined
                }
                selectedOptionsStyle={{
                  paddingRight: hasCondition ? 48 : 0,
                }}
                isClearable
                filterOption={(option, rawInput) => {
                  const inputValue = rawInput.toLocaleLowerCase();
                  const { label } = option;
                  const { altLabel } = option.data;
                  return (
                    label.toLocaleString().toLocaleLowerCase().includes(inputValue) ||
                    altLabel?.toLocaleString().toLocaleLowerCase().includes(inputValue)
                  );
                }}
                theme={theme?.sidebar?.selectTheme}
                styles={theme?.sidebar?.selectStyles}
              />
              {hasCondition && (
                <a
                  onClick={(ev) => {
                    ev.preventDefault();
                    handleInputChange(isConditionSet ? undefined : 'and', {
                      name: `cond_filter_${filter.id}`,
                    });
                  }}
                >
                  <ConditionFilter.Container>
                    <ConditionFilter>
                      <div>
                        <svg
                          viewBox="0 0 16 16"
                          focusable="false"
                          role="img"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ opacity: isConditionSet ? 1 : 0.5 }}
                        >
                          <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"></path>
                          <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"></path>
                        </svg>
                      </div>
                      <span style={{ opacity: isConditionSet ? 1 : 0.5 }}>
                        {t('common:sidebar.combined')}
                      </span>
                    </ConditionFilter>
                  </ConditionFilter.Container>
                </a>
              )}
            </div>
          )}
        </label>
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
      />
    </Option>
  );

  const route = config.routes[type];

  const buttonsBarButtons = (
    <>
      {!route.hideClearButton && (
        <ClearButton
          onClick={clearSearch}
          disabled={Object.values(fields).filter((x) => x).length === 0}
        >
          {t('search:buttons.clear')}
        </ClearButton>
      )}
      {!route.hideFilterButton && (
        <FilterButton type="submit" onClick={doSearch}>
          {t('search:buttons.filter')}
        </FilterButton>
      )}
    </>
  );

  return (
    <Container className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSearch();
          return false;
        }}
      >
        <ButtonsBar>{buttonsBarButtons}</ButtonsBar>
        <Fields>
          {filters
            .filter((filter) => !filter.isOption && filter.isBeforeTextSearch)
            .map(renderFilter)}
          <Field>
            <label>
              {t('project:filters.q', t('search:fields.q'))}
              <StyledInput
                name="q"
                type="search"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputChange(e)}
              />
            </label>
          </Field>
          {filters
            .filter((filter) => !filter.isOption && !filter.isBeforeTextSearch)
            .map(renderFilter)}
          {route.filterByGraph && (
            <Field>
              <label>
                {(config.search.graphFieldLabel && config.search.graphFieldLabel[i18n.language]) ||
                  t('search:fields.graph')}
                <Select
                  inputId="graph"
                  instanceId="graph"
                  name="graph"
                  options={graphOptions}
                  value={graphOptions.find((o) => o.value === fields.graph)}
                  onChange={handleInputChange}
                  placeholder={t('search:labels.select')}
                  isClearable
                  theme={theme?.sidebar?.selectTheme}
                  styles={theme?.sidebar?.selectStyles}
                />
              </label>
            </Field>
          )}
          {filters.some((filter) => filter.isOption) ? (
            <Field>
              <label>
                {t('search:fields.options')}
                {filters.filter((filter) => filter.isOption).map(renderOption)}
              </label>
            </Field>
          ) : null}
        </Fields>

        <MobileButtonsBar>{buttonsBarButtons}</MobileButtonsBar>
      </form>
    </Container>
  );
}

export default Sidebar;
