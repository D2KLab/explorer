import { Component } from 'react';
import Router from 'next/router';
import styled from 'styled-components';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';

import { uriToId, generateMediaUrl } from '@helpers/utils';
import config from '~/config';

const sparqlTransformer = require('sparql-transformer').default;

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

  try {
    const res = await sparqlTransformer(searchQuery, {
      endpoint: config.api.endpoint,
      debug: config.debug,
    });
    results.push(...res['@graph']);
  } catch (err) {
    console.error(err);
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
    border: 1px solid #aaa;
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

const renderSuggestion = (suggestion, { query }) => {
  const suggestionText = `${suggestion.label}`;
  const matches = AutosuggestHighlightMatch(suggestionText, query);
  const parts = AutosuggestHighlightParse(suggestionText, matches);

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
      <SuggestionImage src={generateMediaUrl(mainImage, 150)} alt="" />
      <SuggestionName>
        {parts.map((part, index) => {
          const className = part.highlight ? 'highlight' : null;

          return (
            <span className={className} key={index}>
              {part.text}
            </span>
          );
        })}
      </SuggestionName>
    </SuggestionContent>
  );
};

class SearchInput extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions(value);
    this.setState({
      suggestions,
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    const [routeName, route] =
      Object.entries(config.routes).find(([, r]) => {
        return r.rdfType && r.rdfType === suggestion['@type'];
      }) || [];
    if (route) {
      Router.push({
        pathname: `/${routeName}/${uriToId(suggestion['@id'], { encoding: !route.uriBase })}`,
        // shallow: true
      });
    }
  };

  render() {
    const { value, suggestions } = this.state;
    const { className, placeholder, ariaLabel = 'Search input' } = this.props;

    const inputProps = {
      placeholder,
      value,
      'aria-label': ariaLabel,
      onChange: this.onChange,
    };

    return (
      <Container className={className}>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </Container>
    );
  }
}

export default SearchInput;
