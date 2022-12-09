# SPARQLQueryLink

SPARQL query link.

## Props

* `query = {string}`
* `children = {React.ReactNode}`
  * React children prop

## Example with code

```jsx
// highlight-start
import SPARQLQueryLink from '@components/SPARQLQueryLink';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <SPARQLQueryLink query="SELECT * WHERE { ?s ?p ?o } LIMIT 100">
      View the query
    </SPARQLQueryLink>
    // highlight-end
  );
};
```
