import PropTypes from 'prop-types';
import styled from 'styled-components';
import Router from 'next/router';
import { SearchAlt2 } from '@styled-icons/boxicons-regular/SearchAlt2';
import SearchInput from '@components/SearchInput';

const Form = styled.div`
  display: flex;
  border-bottom: 1px solid #dcdcdc;
  background-color: white;
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
  }
`;

const SearchButton = styled.div`
  display: flex;
  appearance: none;
  background-color: transparent;
  border: none;
  margin-right: auto;
`;

const SearchIcon = styled(SearchAlt2)`
  height: 24px;
`;

const handleSubmit = event => {
  const searchInput = event.target.elements.q;
  Router.pushRoute('search', { q: searchInput.value });
  event.preventDefault();
};

const SearchBox = ({ className, placeholder = 'Search', onSubmit = handleSubmit }) => {
  return (
    <Form className={className} action="/browse" method="POST" onSubmit={onSubmit}>
      <SearchButton as="button" type="submit">
        <SearchIcon />
      </SearchButton>
      <StyledSearchInput type="search" name="q" placeholder={placeholder} />
    </Form>
  );
};

export default SearchBox;
