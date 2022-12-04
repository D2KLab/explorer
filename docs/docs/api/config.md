---
sidebar_position: 0
---

# `config.js`

## Overview {#overview}

`config.js` contains configurations for your site and is placed in the root directory of your site.

It usually exports a site configuration object:

```js title="config.js"
module.exports = {
  // site config...
};
```

## Root fields {#root-fields}

### `debug` {#debug}

- Type: `boolean`

```js title="config.js"
module.exports = {
  debug: true,
};
```

## Metadata fields {#metadata-fields}

### `title` {#metadata-title}

- Type: `string | undefined`

Title for your website. Will be used in metadata and as browser tab title.

```js title="config.js"
module.exports = {
  metadata: {
    title: 'D2KLab Explorer',
  },
};
```

### `logo` {#metadata-logo}

- Type: `string | undefined`

```js title="config.js"
module.exports = {
  metadata: {
    logo: '/images/logo.png',
  },
};
```

## Home fields {#home-fields}

```ts
type HomeConfig = {
  hero?: HomeHeroConfig;
}
```

```ts
type HomeHeroConfig = {
  showHeadline?: boolean;
  showLogo?: boolean;
}
```

## Routes fields {#routes-fields}

```ts
type RouteConfig = {
  view?: string;
  showInNavbar?: boolean;
  rdfType?: string;
  uriBase?: string;
  details?: DetailsConfig;
  filters: Filter[];
  baseWhere?: string | string[];
  query?: QueryObject;
};
```

```ts
type DetailsConfig = {
  view?: string;
  query?: QueryObject;
};
```

```ts
type Filter = {
  id: string;
  label?: string;
  isMulti?: boolean;
  isOption?: boolean;
  isSortable?: boolean;
  query?: QueryObject;
  whereFunc?: (value: string) => string | string[] | null | undefined;
  filterFunc?: (value: string) => string | string[] | null | undefined;
  labelFunc?: (props: any) => string | null | undefined;
};
```

## Gallery fields {#gallery-fields}

The full list of `CarouselProps` can be found in [react-responsive-carousel documentation](https://github.com/leandrowd/react-responsive-carousel#props).

```ts
type GalleryConfig = {
  options: CarouselProps;
};
```

## Vocabularies fields {#vocabularies-fields}

## `QueryObject` {#QueryObject}

Taken from [sparql-transformer](https://github.com/D2KLab/sparql-transformer#the-root--properties).

```ts
type QueryObject = {
  /**
   * Add where clause in the triple format.
   * Ex. "$where": "?id a dbo:City"
   */
  $where?: string | any[];
  /**
   * Set VALUES for specified variables as a map.
   * The presence of a lang tag or of the '$lang' attribute attached to the related property is taken in account.
   * Ex. "$values": {"?id": ["dbr:Bari", "http://dbpedia.org/resource/Bologna"]}
   */
  $values?: object;
  /** LIMIT the SPARQL results */
  $limit?: number;
  /** Perform the LIMIT operation in the query or on the obtained results (library) */
  $limitMode?: 'query' | 'library';
  /** Define the graph FROM which selecting the results */
  $from?: string | string[];
  /** OFFSET applied to the SPARQL results */
  $offset?: number;
  /** Set the DISTINCT in the select */
  $distinct?: boolean;
  /**
   * Build an ORDER BY on the variables in the input.
   * Ex. "$orderby":["DESC(?name)","?age"]
   */
  $orderby?: string | string[];
  /**
   * Build an GROUP BY on the variables in the input.
   * Ex. "$groupby":"?id"
   */
  $groupby?: string | string[];
  /** Allows to declare the content of HAVING. If it is an array, the items are concatenated by &&. */
  $having?: string | string[];
  /**
   * Add the content as a FILTER.
   * Ex. "$filter": "?myNum > 3"
   */
  $filter?:	string | string [];
  /** Set the prefixes in the format "foaf": "http://xmlns.com/foaf/0.1/". */
  $prefixes?: object;
  /**
   * The default language to use as $bestlang, expressed through the Accept-Language standard.
   * See: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
   * Ex. $lang:en;q=1, it;q=0.7 *;q=0.1
   */
  $lang?: string;
  /**
   * When hide, language tags are not included in the output.
   * Similar to the inline $langTag, but acting at a global level.
   * Defaults to 'show'.
   * Ex. hide => "label":"Bologna" ; show => "label":{"value": "Bologna", "language": "it"}
   */
  $langTag?: 'hide' | 'show';
}
```

## See also

* [sparql-transformer](https://github.com/D2KLab/sparql-transformer)
