import { SearchAlt2 } from '@styled-icons/boxicons-regular/SearchAlt2';
import { Button as ReakitButton } from 'ariakit';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import SearchInput from '@components/SearchInput';
import config from '~/config';

const Form = styled.form`
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
    font-size: inherit;
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

/**
 * A search box.
 * @param {string} [className] - The class name to apply to the search box.
 * @param {string} [placeholder] - The placeholder text to display in the search box.
 * @returns A search box.
 */
function SearchBox({ className, placeholder = 'Search' }) {
  const { t } = useTranslation('common');
  return (
    <Form className={className} action={`/${config.search.route}`} method="GET">
      <SearchButton aria-label={t('common:buttons.search')} type="submit">
        <SearchIcon />
      </SearchButton>
      <StyledSearchInput type="search" name="q" placeholder={placeholder} />
    </Form>
  );
}

export default SearchBox;
