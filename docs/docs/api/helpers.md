---
sidebar_position: 4
toc_max_heading_level: 5
---

# Helpers

:::note

This page is a draft and some informations might be missing.

:::

## utils

* Module: `@helpers/utils`

### `uriToId`

Gets the last part of an URI.

#### Example with code

* `uri`
* `{ base }`

```js
import { uriToId } from '@helpers/utils';

// returns "Tim_Berners-Lee"
uriToId('http://dbpedia.org/page/Tim_Berners-Lee', { base: 'http://dbpedia.org/page' })
```

### `idToUri`

Converts an ID back to an URI, given a base.

#### Parameters

* `id`
* `{ base }`

#### Example with code

```js
import { idToUri } from '@helpers/utils';

// returns "http://dbpedia.org/page/Tim_Berners-Lee"
idToUri('Tim_Berners-Lee', { base: 'http://dbpedia.org/page' })
```

### `generateMediaUrl`

Generates an optimized version of an image by using the embedded image processing service from D2KLab Explorer.

This is particularly useful for generating thumbnails.

#### Parameters

* `url`
* `width`
* `height`

#### Example with code

```js
import { generateMediaUrl } from '@helpers/utils';

// returns the URL as a string
generateMediaUrl(url, 150, 150);
```

### `absoluteUrl`

#### Parameters

* `req = {NextApiRequest}`
* `localhostAddress = {string | default: "localhost:3000"}`

#### Example with code

```js
// highlight-start
import { absoluteUrl } from '@helpers/utils';
// highlight-end

export async function getServerSideProps({ req, res, query, locale }) {
  const graphs = await (
    await fetch(
      // highlight-start
      `${absoluteUrl(req)}/api/graphs`,
      // highlight-end
      {
        headers: req.headers,
      }
    )
  ).json();
}
```

### `getQueryObject`

### Example with code

```js
// highlight-start
const queryObj = getQueryObject(query);
// highlight-end
const results = await SparqlClient.query(queryObj);
```

### `slugify`

### Example with code

```js
// returns "rene-descartes"
slugify("René Descartes");
```

### `linkify`

### Example with code

```js
// returns "The url <a href="https://dbpedia.org/" target="_blank">https://dbpedia.org/</a> is now clickable"
linkify("The url https://dbpedia.org/ is now clickable")
```

## api

* Module: `@helpers/api`

### `validateRequest`

Check if a request is valid based on passed options.

#### Parameters

* `req`
* `res`
* `options`
  * `useSession` (`boolean`): Checks if the user is authenticated, otherwise throw an HTTPError 403.
  * `allowedMethods` (`string[]`): Checks if the HTTP method is allowed.

### `withRequestValidation`

#### Parameters

* `options`: Same options as for [validateRequest](#validateRequest).

#### Example with code

```js
import { withRequestValidation } from '@helpers/api';

export default withRequestValidation({
  useSession: true,
  allowedMethods: ['POST'],
})(async (req, res) => {
  res.status(200).end();
});
```

## explorer

* Module: `@helpers/explorer`

### `findRouteByRDFType`

### `getEntityMainLabel`

### `getEntityMainImage`

### `generatePermalink`

### `getSearchData`

## sparql

* Module: `@helpers/sparql`

### `getSparqlQuery`

### `query`

## useDebounce

* Module: `@helpers/useDebounce`

Hook based on [useDebounce](https://usehooks.com/useDebounce/).

## useDidMountEffect

* Module: `@helpers/useDidMountEffect`

Used like `useEffect` but will only be triggered after the initial mount.

## useGraphs

* Module: `@helpers/useGraphs`

## useOnScreen

* Module: `@helpers/useOnScreen`

Hook based on [useOnScreen](https://usehooks.com/useOnScreen/).
