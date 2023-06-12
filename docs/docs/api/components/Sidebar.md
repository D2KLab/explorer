# Sidebar

Sidebar.

## Props

* `onSearch = {function}`
* `type = {string}`
* `filters = {object[]}`
* `query = {object}`
* `renderEmptyFields = {boolean}`

## Example with code

```jsx
import { useRouter } from 'next/router';

import { getFilters } from '@helpers/search';
// highlight-start
import Sidebar from '@components/Sidebar';
// highlight-end

const MyPage = ({ filters }) => {
  const { query } = useRouter();

  const onSearch = (fields) => {
    console.log('onSearch:', fields);
  };

  return (
    // highlight-start
    <Sidebar
      type={query.type}
      query={query}
      filters={filters}
      onSearch={onSearch}
      collapsed={false}
      renderEmptyFields={true}
    />
    // highlight-end
  );
};

export async function getServerSideProps({ req, res, query, locale }) {
  const filters = await getFilters(query, { language: locale });

  return {
    props: {
      filters,
    },
  };
}
```
