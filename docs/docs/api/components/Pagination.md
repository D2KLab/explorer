# Pagination

Used to display a pagination for next/previous results. Pagination will appear if the user clicked on a [PaginatedLink](PaginatedLink).

## Props

* `searchData = {object}`
* `result = {object}`

## Example with code:

```jsx
import { absoluteUrl } from '@helpers/utils';
// highlight-start
import Pagination from '@components/Pagination';
// highlight-end

const MyPage = ({ result, searchData }) => {
  return (
    // highlight-start
    <Pagination searchData={searchData} result={result} />
    // highlight-end
  );
};

export async function getServerSideProps(context) {
  const { req, res, query, locale } = context;

  const id = 'http://dbpedia.org/resource/France';

  const { result = null } = await (
    await fetch(`${absoluteUrl(req)}/api/entity?id=${id}`, {
      headers: {
        ...req.headers,
        'accept-language': locale,
      },
    })
  ).json();

  if (!result && res) {
    res.statusCode = 404;
  }

  const searchData = await getSearchData(context);

  return {
    props: {
      result,
      searchData,
    },
  };
}
```
