import Link from 'next/link';
import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState, useCallback } from 'react';
import Autosuggest from 'react-autosuggest';
import styled from 'styled-components';

import Spinner from '@components/Spinner';
import { findRouteByRDFType, getEntityMainLabel } from '@helpers/explorer';
import { uriToId, generateMediaUrl } from '@helpers/utils';
import config from '~/config';

const SuggestionContent = styled.span`
  display: flex;
  align-items: center;
`;

const SuggestionImage = styled.img`
  display: block;
  max-width: 45px;
  max-height: 45px;
  margin-right: 10px;
`;

const SuggestionName = styled.span`
  &.highlight {
    font-weight: 700;
  }
`;

const Container = styled.div`
  display: flex;
  width: 280px;
  min-width: 0;

  .react-autosuggest__suggestions-container {
    display: none;
  }

  .react-autosuggest__container {
    position: relative;
    display: flex;
    min-width: 0;
    width: 100%;
  }

  .react-autosuggest__container--open .react-autosuggest__suggestions-container {
    display: block;
    position: absolute;
    top: 30px;
    right: 0;
    max-width: 560px;
    border: 1px solid #666;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    z-index: 2;
  }

  .react-autosuggest__suggestions-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .react-autosuggest__suggestion {
    cursor: pointer;
    padding: 10px 20px;
  }

  .react-autosuggest__suggestion:not(:first-child) {
    border-top: 1px solid #ddd;
  }

  .react-autosuggest__suggestion--focused,
  .react-autosuggest__suggestion--highlighted {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`;

function debounce(fn, time) {
  let timeoutId;
  return function wrapper(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, time);
  };
}

/**
 * A custom input component that uses the react-autosuggest library.
 * @param {string} className - The class name of the input.
 * @param {string} placeholder - The placeholder text of the input.
 * @param {string} ariaLabel - The aria label of the input.
 * @param {string} value - The value of the input.
 * @param {Function} [onChange] - The function to call when the input changes.
 * @param {Function} [onBlur] - The function to call when the input loses focus.
 * @param {Function} [onFocus] - The function to call when the input gains focus.
 */
function SearchInput({ className, placeholder, ariaLabel = 'Search input', ...props }) {
  const [inputValue, setInputValue] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation(['search']);

  const getSuggestionValue = (suggestion) => {
    const [, route] = findRouteByRDFType(suggestion['@type']);
    const label = getEntityMainLabel(suggestion, { route, language: i18n.language });
    return label;
  };

  const getSuggestions = async (value) => {
    setIsLoading(true);

    const response = await (
      await fetch(
        `/api/autocomplete?${new URLSearchParams({
          hl: i18n.language,
          q: value,
        })}`,
      )
    ).json();

    setIsLoading(false);
    setTotalResults(response.totalResults);

    return response.results;
  };

  const renderSuggestion = (suggestion) => {
    const [, route] = findRouteByRDFType(suggestion['@type']);
    const label = getEntityMainLabel(suggestion, { route, language: i18n.language });

    let mainImage = null;
    if (suggestion.representation && suggestion.representation.image) {
      mainImage = Array.isArray(suggestion.representation.image)
        ? suggestion.representation.image.shift()
        : suggestion.representation.image;
    } else if (Array.isArray(suggestion.representation)) {
      mainImage =
        suggestion.representation[0].image ||
        suggestion.representation[0]['@id'] ||
        suggestion.representation[0];
    }

    return (
      <SuggestionContent>
        <SuggestionImage src={generateMediaUrl(mainImage, 90)} alt="" />
        <SuggestionName>{label}</SuggestionName>
      </SuggestionContent>
    );
  };

  const renderSuggestionsContainer = ({ containerProps, children }) => (
    <div {...containerProps}>
      {children}
      <div className="react-autosuggest__suggestion">
        <SuggestionContent>
          <SuggestionName>
            <Link href={`/${config.search.route}?q=${encodeURIComponent(inputValue)}`}>
              <em>{t('search:labels.searchResults', { count: totalResults })}</em>
            </Link>
          </SuggestionName>
        </SuggestionContent>
      </div>
    </div>
  );

  const onChange = (event, { newValue }) => {
    setInputValue(newValue);
  };

  const onSuggestionsFetchRequested = useCallback(
    debounce(async ({ value }) => {
      setSuggestions(await getSuggestions(value));
    }, 500),
    [],
  );

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    const [routeName, route] = findRouteByRDFType(suggestion['@type']);

    if (route) {
      Router.push({
        pathname: `/${routeName}/${encodeURI(uriToId(suggestion['@id'], { base: route.uriBase }))}`,
        query: {
          q: inputValue,
          sapi: 'autocomplete',
          spath: `/${routeName}`,
        },
      });
    } else {
      console.warn('Route not found:', routeName, 'for suggestion type:', suggestion['@type']);
    }
  };

  const inputProps = {
    placeholder,
    value: inputValue,
    'aria-label': ariaLabel,
    onChange,
    ...props,
  };

  return (
    <Container className={className}>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSuggestionSelected}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        renderSuggestionsContainer={renderSuggestionsContainer}
      />
      {isLoading && <Spinner size="24" style={{ marginRight: '1em' }} />}
    </Container>
  );
}

export default SearchInput;
