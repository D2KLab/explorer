import { useState } from 'react';
import Router from 'next/router';
import styled from 'styled-components';
import Autosuggest from 'react-autosuggest';

import { uriToId, generateMediaUrl } from '@helpers/utils';
import { findRouteByRDFType } from '@helpers/explorer';
import { query } from '@helpers/sparql';
import config from '~/config';

function getSuggestionValue(suggestion) {
  return `${suggestion.label}`;
}

async function getSuggestions(value) {
  const results = [];

  const searchQuery = JSON.parse(JSON.stringify(config.search.textSearchQuery));
  searchQuery.$filter = searchQuery.$filter || [];
  if (typeof config.search.filterFunc === 'function') {
    searchQuery.$filter.push(...config.search.filterFunc(value));
  } else {
    searchQuery.$filter.push(`regex(?label, "${value}", "i")`);
  }

  const res = await query(searchQuery, {
    endpoint: config.api.endpoint,
    debug: config.debug,
  });
  if (res) {
    results.push(...res['@graph']);
  }

  return results;
}

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
    font-weight: bold;
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
    font-size: 16px;
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

const renderSuggestion = (suggestion) => {
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
      <SuggestionName>{suggestion.label}</SuggestionName>
    </SuggestionContent>
  );
};

const SearchInput = ({ className, placeholder, ariaLabel = 'Search input', ...props }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const onChange = (event, { newValue }) => {
    setInputValue(newValue);
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    setSuggestions(await getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    const [routeName, route] = findRouteByRDFType(suggestion['@type']);

    if (route) {
      Router.push({
        pathname: `/${routeName}/${encodeURIComponent(
          uriToId(suggestion['@id'], { base: route.uriBase })
        )}`,
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
      />
    </Container>
  );
};

export default SearchInput;
