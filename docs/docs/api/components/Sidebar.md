# Sidebar

Sidebar.

## Props

* `onSearch = {function}`
* `type = {string}`
* `filters = {object[]}`
* `query = {object}`

## Example with code

```jsx
import { useRouter } from 'next/router';

import { getFilters } from '@pages/api/search';
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
      submitOnChange
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
