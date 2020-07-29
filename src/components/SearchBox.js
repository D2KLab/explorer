import styled from 'styled-components';
import Router from 'next/router';
import { Button as ReakitButton } from 'reakit';
import { SearchAlt2 } from '@styled-icons/boxicons-regular/SearchAlt2';

import SearchInput from '@components/SearchInput';

const Form = styled.div`
  display: flex;
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 0.25em;
`;

const StyledSearchInput = styled(SearchInput)`
  .react-autosuggest__input {
    flex: 1;
    min-width: 0;
    appearance: none;
    background-color: transparent;
    border: none;
    font-size: 0.9em;
    outline: 0;
  }
`;

const SearchButton = styled(ReakitButton)`
  display: flex;
  appearance: none;
  background-color: transparent;
  border: none;
  margin-right: auto;
`;

const SearchIcon = styled(SearchAlt2)`
  height: 24px;
`;

const handleSubmit = (event) => {
  const searchInput = event.target.elements.q;
  Router.pushRoute('search', { q: searchInput.value });
  event.preventDefault();
};

const SearchBox = ({ className, placeholder = 'Search', onSubmit = handleSubmit }) => {
  return (
    <Form className={className} action="/browse" method="POST" onSubmit={onSubmit}>
      <SearchButton aria-label="Search" type="submit">
        <SearchIcon />
      </SearchButton>
      <StyledSearchInput type="search" name="q" placeholder={placeholder} />
    </Form>
  );
};

export default SearchBox;
