# PaginatedLink

Paginated link.

## Props

* `id = {string}`
* `type = {string}`
* `searchApi = {string}`
* `searchParams = {object}`
* Any props from [next/link](https://nextjs.org/docs/api-reference/next/link)

## Example with code:

```jsx
// highlight-start
import PageTitle from '@components/PageTitle';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <PaginatedLink id="http://dbpedia.org/resource/France" type="countries" searchApi="search">
      My link
    </PaginatedLink>
    // highlight-end
  );
};
```
