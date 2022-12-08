---
sidebar_position: 0
toc_max_heading_level: 5
---

import Indent from '@site/src/components/Indent';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `config.js`

## Overview {#overview}

`config.js` contains configurations for your site and is placed in the root directory of your site.

It usually exports a site configuration object:

```js title="config.js"
module.exports = {
  // site config...
};
```

## Properties

### `debug` {#debug}

* Type: `boolean`

Set to `true` to enable debug mode. When debug mode is enabled, additional content such as SPARQL queries and outputs will be displayed on the pages.

```js title="config.js"
module.exports = {
  metadata: {
    debug: true,
  },
};
```

### `metadata` {#metadata}

* Type: `object`

Configuration for site metadata.

<Indent>

#### `title` {#metadata-title}

* Type: `string`

Title for your website. Will be used in metadata and as browser tab title.

```js title="config.js"
module.exports = {
  metadata: {
    title: 'D2KLab Explorer',
  },
};
```

#### `logo` {#metadata-logo}

* Type: `string`

```js title="config.js"
module.exports = {
  metadata: {
    logo: '/images/logo.png',
  },
};
```

</Indent>

### `head` {#head}

* Type: `object`

Configuration for head.

<Indent>

#### `styles` {#head-styles}

* Type: `string[]`

List of URLs of styles to import.

```js title="config.js"
module.exports = {
  head: {
    styles: ['https://fonts.googleapis.com/css?family=Libre+Caslon+Text'],
  },
};
```

</Indent>

### `home` {#home}

* Type: `object`

Configuration for the homepage.

<Indent>

#### `hero` {#home-hero}

* Type: `object`

Configuration of the hero section on the homepage.

<Indent>

##### `showHeadline` {#home-hero-showHeadline}

* Type: `boolean`

Set to `true` to display the headline on the homepage hero section. See [home.json](translations#home) to change the headline text.

```js title="config.js"
module.exports = {
  home: {
    hero: {
      showHeadline: true,
    },
  },
};
```

##### `showLogo` {#home-hero-showLogo}

* Type: `boolean`

Set to `true` to display the [logo](#metadata-logo) on the homepage hero section.

```js title="config.js"
module.exports = {
  home: {
    hero: {
      showLogo: true,
    },
  },
};
```

</Indent>

</Indent>

### `footer` {#footer}

* Type: `object`

Configuration for footer.

<Indent>

#### `logo` {#footer-logo}

* Type: `string[]`

List of images to display in the footer. If not set, the [website logo](#metadata-logo) will be displayed instead.

```js title="config.js"
module.exports = {
  footer: {
    logo: ['/images/eu-logo.png', '/images/footer.png'],
  },
};
```

</Indent>

### `search` {#search}

* Type: `object`

Configuration for search.

<Indent>

#### `route` {#search-route}

* Type: `string`

The route key to be used when searching for an item.

```js title="config.js"
module.exports = {
  search: {
    route: 'countries',
  },
  routes: {
    countries: {
      // ...
    },
  },
};
```

#### `allowTextSearch` {#search-allowTextSearch}

* Type: `boolean`

If set to `true`, text search will be enabled through the interface.

```js title="config.js"
module.exports = {
  search: {
    allowTextSearch: true,
  },
};
```

#### `allowImageSearch` {#search-allowImageSearch}

* Type: `boolean`

If set to `true`, image search will be enabled through the interface.

```js title="config.js"
module.exports = {
  search: {
    allowImageSearch: true,
  },
};
```

#### `placeholderImage` {#search-placeholderImage}

* Type: `string`

URL to an image used as a placeholder when there is no images for a result.

```js title="config.js"
module.exports = {
  search: {
    placeholderImage: '/images/placeholder.jpg',
  },
};
```

#### `languages` {#search-languages}

* Type: `object`

An object which represents the languages available in the website. The key is a [UTS Locale Identifier](https://www.unicode.org/reports/tr35/tr35-59/tr35.html#Identifiers). The value is the language name to be displayed through the interface.

```js title="config.js"
module.exports = {
  search: {
    languages: {
      en: 'English',
      'fr-CA': 'French (Canada)',
      'fr': 'French',
    },
  },
};
```

#### `defaultLanguage` {#search-defaultLanguage}

* Type: `string`

This is the default language to use when visiting the website.

```js title="config.js"
module.exports = {
  search: {
    defaultLanguage: 'en',
  },
};
```

</Indent>

### `api` {#api}

<Indent>

* Type: `object`

Configuration for api.

#### `endpoint` {#api-endpoint}

* Type: `string`

URL to the SPARQL endpoint used for querying.

```js title="config.js"
module.exports = {
  api: {
    endpoint: 'https://dbpedia.org/sparql',
  },
};
```

#### `params` {#api-params}

* Type: `object`

Additional URL parameters passed while querying the endpoint.

For example, passing `{ endpoint: 'https://dbpedia.org/sparql', timeout: '10000' }` will generate the following URL: `https://dbpedia.org/sparql?timeout=10000`.

```js title="config.js"
module.exports = {
  api: {
    params: {
      timeout: '10000',
    },
  },
};
```

#### `queryLink` {#api-queryLink}

* Type: `function(string) => string`

Used for customizing the URL for editing the query when [debug mode](#debug) is enabled. Some triple stores have different URL patterns. For example, Virtuoso uses a `qtxt` parameter, while GraphDB uses a `query` parameter.

The function takes a string (the SPARQL query) and expects a string (the URL)

```js title="config.js"
module.exports = {
  api: {
    queryLink: (query) => `https://dbpedia.org/sparql?qtxt=${encodeURIComponent(query)}`,
  },
};
```

#### `permalinkUrl` {#api-permalinkUrl}

* Type: `function(string) => string`

Used for customizing the permalink URL displayed on the details page.

The function takes a string (the SPARQL query) and expects a string (the URL)

```js title="config.js"
module.exports = {
  api: {
    permalinkUrl: (uri) => `https://dbpedia.org/describe/?url=${encodeURIComponent(uri)}`,
  },
};
```

#### `prefixes` {#api-prefixes}

* Type: `object`

List of [SPARQL prefixes](https://www.w3.org/TR/sparql11-query/#prefNames) added to the SPARQL query.

```js title="config.js"
module.exports = {
  api: {
    prefixes: {
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      schema: 'https://schema.org/',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      time: 'http://www.w3.org/2006/time#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    },
  },
};
```

</Indent>

### `routes` {#routes}

* Type: `object`

Configuration for routes.

<details>
  <summary>Full example of a route with queries and filters</summary>

This route uses `https://dbpedia.org/sparql` as an [endpoint](#api-endpoint).

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      view: 'browse',
      showInNavbar: true,
      rdfType: 'http://dbpedia.org/ontology/Country',
      uriBase: 'http://dbpedia.org/resource',
      details: {
        view: 'gallery',
      },
      filters: [
        {
          id: 'language',
          label: 'Language',
          isMulti: true,
          isSortable: true,
          query: {
            '@graph': [
              {
                '@id': '?language',
                label: '?label',
              },
            ],
            $where: [
              '?country a <http://dbpedia.org/ontology/Country>',
              '?country <http://dbpedia.org/ontology/language> ?language',
              '?language rdfs:label ?label',
            ],
            $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
            $langTag: 'hide',
          },
          whereFunc: () => ['?id <http://dbpedia.org/ontology/language> ?language'],
          filterFunc: (val) => `?language = <${val}>`,
        },
      ],
      baseWhere: [
        '?id a <http://dbpedia.org/ontology/Country>',
        '?id a <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations>',
        '?id dbo:capital ?capital',
        'FILTER NOT EXISTS { ?id <http://dbpedia.org/ontology/dissolutionYear> ?yearEnd }',
      ],
      query: {
        '@graph': [
          {
            '@type': 'http://dbpedia.org/ontology/Country',
            '@id': '?id',
            label: '$<http://www.w3.org/2000/01/rdf-schema#label>$lang:en',
            description: '$dbo:abstract$lang:en',
            representation: {
              '@id': '?image',
              image: '?image',
            },
            capital: {
              '@id': '?capital',
              label: '?capitalLabel',
            },
          },
        ],
        $where: [
          `OPTIONAL {
            ?id dbo:capital ?capital .
            ?capital <http://www.w3.org/2000/01/rdf-schema#label> ?capitalLabel .
            FILTER(langmatches(lang(?capitalLabel), "en") || lang(?capitalLabel) = "")
          }`,
          '?id dbo:thumbnail ?image',
        ],
        $langTag: 'hide',
      },
    },
  },
};
```

</details>

<Indent>

#### `view` {#routes-view}

* Type: `string`

Name of the view to use for displaying the route.

Available views by default:

* `browse` - Classic search results page with a sidebar for filtering.

You can also [create a custom page](/creating-pages) and refer to it with the `view` property.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      view: 'browse',
    },
  },
};
```

#### `showInNavbar` {#routes-showInNavbar}

* Type: `boolean`

If set to `true`, the route will be displayed in the navbar at the top of the website.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      showInNavbar: true,
    },
  },
};
```

#### `filterByGraph` {#routes-filterByGraph}

* Type: `boolean`

If set to `true`, the sidebar will have a graph input filter. The list of graphs is obtained by the [graphs](#graphs) property.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      filterByGraph: true,
    },
  },
};
```

#### `hideFilterButton` {#routes-hideFilterButton}

* Type: `boolean`

If set to `true`, the filter button will be hidden in the sidebar.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      hideFilterButton: true,
    },
  },
};
```

#### `rdfType` {#routes-rdfType}

* Type: `string`

RDF type of the resources for this route.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      rdfType: 'http://dbpedia.org/ontology/Country',
    },
  },
};
```

#### `uriBase` {#routes-uriBase}

* Type: `string`

Base URI of resources for this route. It is optional, and is used to generate shorter links for details pages, by removing the base URI from the URL.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      uriBase: 'http://dbpedia.org/resource',
    },
  },
};
```

#### `filters` {#routes-filters}

* Type: `object[]`

List of filters.

<Indent>

##### `id` {#route-filters-id}

* Type: `string`

Unique identifier of the filter.

```js title="Example"
{
  id: 'language',
}
```

##### `label` {#route-filters-label}

* Type: `string`

Label of the filter.

```js title="Example"
{
  label: 'Language',
}
```

##### `isMulti` {#route-filters-isMulti}

* Type: `boolean`

If set to `true`, allows the user to select more than one value.

##### `isToggle` {#route-filters-isToggle}

* Type: `boolean`

If set to `true`, changes the input type to a checkbox, and expects `values` to be defined (see the [values](#route-filters-values) property).

##### `values` {#route-filters-values}

* Type: `object[]`

```js title="Example"
{
  values: [
    { label: 'Option 1', value: 'first' },
    { label: 'Option 2', value: 'second' },
    { label: 'Option 3', value: 'third' },
  ],
}
```

The default value can be selected using the [defaultOption](#route-filters-defaultOption) property.

##### `defaultOption` {#route-filters-defaultOption}

* Type: `number`

Index from the [values](#route-filters-values) property to be selected as the default value.

```js title="Example"
{
  defaultOption: 2,
}
```

##### `isSortable` {#route-filters-isSortable}

* Type: `boolean | object`

If set to `true`, allows the user to sort search results by the value of this filter.

If defined as an object, the following properties are accepted:

* `variable` (`string`) - The name fo the variable to use for sorting.
* `reverse` (`boolean`) - If set to `true`, allow for both ascendant/descendant order.

##### `query` {#route-filters-query}

* Type: `QueryObject | function() => QueryObject`

The function takes an optional parameter (`{ language, params }`) and expects a [QueryObject](#QueryObject).

* language: The language code (eg. "en", "fr")
* params: An object containing query parameters (such as filters, or sort options)

##### `whereFunc` {#route-filters-whereFunc}

* Type: `function(string, number) => string | string[]`

Additional WHERE condition to append to the search query when the user selected a value from this filter.

It takes the following optional parameters:

* `value` (`string`) - The value selected by the user for this filter.
* `index` (`number`) - The index of the value.

```js title="Example"
{
  whereFunc: () => ['?id <http://dbpedia.org/ontology/language> ?language'],
}
```

##### `filterFunc` {#route-filters-filterFunc}

* Type: `function(string, number) => string | string[]`

Additional FILTER condition to append to the search query when the user selected a value from this filter.

It takes the following optional parameters:

* `value` (`string`) - The value selected by the user for this filter.
* `index` (`number`) - The index of the value.

```js title="Example"
{
  filterFunc: (val) => `?language = <${val}>`,
}
```

The above example will generate the following query:

```sparql
FILTER(?language = "...")
```

</Indent>

##### `style` {#route-filters-style}

* Type: `object`

React Stylesheet object used for customizing the appearance of a filter input.

```js title="Example"
{
  style: {
    paddingBottom: 24,
    borderBottom: '1px solid #b5afbe',
  },
}
```

#### `baseWhere` {#routes-baseWhere}

* Type: `string | string[]`

Base condition of the query. This condition will be applied to the main [query](#routes-query) as well as the filters.

```js
{
  baseWhere: [
    '?id a <http://dbpedia.org/ontology/Country>',
    '?id a <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations>',
    '?id dbo:capital ?capital',
    'FILTER NOT EXISTS { ?id <http://dbpedia.org/ontology/dissolutionYear> ?yearEnd }',
  ],
}
```

#### `query` {#routes-query}

* Type: `QueryObject | function() => QueryObject`

The function takes an optional parameter (`{ language, params }`) and expects a [QueryObject](#QueryObject).

* language: The language code (eg. "en", "fr")
* params: An object containing query parameters (such as filters, or sort options)

```js
{
  query: ({ language }) => ({
    '@graph': [
      {
        '@type': 'http://dbpedia.org/ontology/Country',
        '@id': '?id',
        label: '$<http://www.w3.org/2000/01/rdf-schema#label>$lang:en',
        description: '$dbo:abstract$lang:en',
        representation: {
          '@id': '?image',
          image: '?image',
        },
        capital: {
          '@id': '?capital',
          label: '?capitalLabel',
        },
      },
    ],
    $where: [
      `OPTIONAL {
        ?id dbo:capital ?capital .
        ?capital <http://www.w3.org/2000/01/rdf-schema#label> ?capitalLabel .
        FILTER(langmatches(lang(?capitalLabel), "${language}")
      }`,
      '?id dbo:thumbnail ?image',
    ],
    $langTag: 'hide',
  }),
}
```

#### `details` {#routes-details}

* Type: `object`

Configuration for the details view of this route.

<Indent>

##### `view` {#route-details-view}

* Type: `string`

Name of the view to use for displaying the details page.

Available views by default:

* `gallery` - Gallery page with an image carousel.
* `collection` - Collection page with a list of items.
* `video` - Page with a video player.

You can also [create a custom page](/creating-pages) and refer to it with the `view` property.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      details: {
        view: 'gallery',
      }
    },
  },
};
```

##### `showPermalink` {#route-details-showPermalink}

* Type: `bolean`

If set to `true`, permalink will be visible on the details page. Generation of permalinks is handled by the [permalinkUrl](#api-permalinkUrl) property.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      showPermalink: true,
    },
  },
};
```

##### `excludedMetadata` {#route-details-excludedMetadata}

* Type: `string[]`

List of metadata to exclude from the details view. This is useful if you have a single query for both the search view and the details view, but certain properties should only be visible on the search page and you want to exclude them from the details page.

```js title="config.js"
module.exports = {
  routes: {
    countries: {
      query: {
        '@context': 'http://schema.org/',
        '@graph': [
          {
            '@id': '?id',
            '@graph': '?g',
            label: '?label',
            description: '?description',
          },
        ],
        $where: [/* ... */],
      },
      details: {
        excludedMetadata: ['description'],
      },
    },
  },
};
```

##### `query` {#route-details-query}

* Type: `QueryObject | function() => QueryObject`

:::tip

If you plan to use the same query for the search and for the details, you can simply omit this property and the details view will use the same query as the [route query](#routes-query).

:::


The function takes an optional parameter (`{ language, params }`) and expects a [QueryObject](#QueryObject).

* language: The language code (eg. "en", "fr")
* params: An object containing query parameters (such as filters, or sort options)

</Indent>

</Indent>

### `graphs` {#graphs}

* Type: `object | function() => QueryObject`

It is used to display the name, icon, and url of the graph in details pages, as well as in the Graph filter on the sidebar. You can use either an object or a query to retrieve the list of graphs.

Available properties are:

* `label` - Graph name which will be displayed on the interface.
* `icon` - URL to an image file used for the icon _(optional)_.
* `url` - Website URL _(optional)_.

<Tabs>
  <TabItem value="list" label="Example using a list" default>

```js title="config.js"
module.exports = {
  graphs: {
    'http://data.silknow.org/graph/mad': {
      label: 'Musée des Arts Décoratifs',
      icon: '/images/graphs/http-data-silknow-org-mad.png',
      url: 'https://madparis.fr/',
    },
    'http://data.silknow.org/graph/mfa': {
      label: 'Boston Museum of Fine Arts',
      icon: '/images/graphs/http-data-silknow-org-mfa.png',
      url: 'https://www.mfa.org/',
    },
  },
};
```

  </TabItem>
  <TabItem value="query" label="Example using a query">

The function takes one optional parameter (`language`) and expects a [QueryObject](#QueryObject).

```js title="config.js"
module.exports = {
  graphs: ({ language }) => ({
    '@context': 'http://schema.org/',
    '@graph': [
      {
        '@id': '?g',
        label: '?label',
      },
    ],
    $where: ['GRAPH ?g { ?id a od:L11_Smell }', '?g rdfs:label ?label'],
    $filter: [`LANG(?label) = "${language}"`]
    $orderby: 'ASC(?label)',
  }),
};
```

  </TabItem>
</Tabs>

### `gallery` {#gallery}

* Type: `object`

Configuration for gallery.

<Indent>

#### `options` {#gallery-options}

* Type: `object`

The full list of properties can be found in the [react-responsive-carousel documentation](https://github.com/leandrowd/react-responsive-carousel#props).

```js title="config.js"
module.exports = {
  gallery: {
    options: {
      showArrows: true,
      showStatus: true,
      showIndicators: false,
      infiniteLoop: false,
      showThumbs: true,
      autoPlay: false,
      stopOnHover: true,
      swipeable: true,
      dynamicHeight: false,
      emulateTouch: true,
    },
  },
};
```

</Indent>

### `vocabularies` {#vocabularies}

* Type: `object`

Configuration for Vocabularies.

This property is used for optimizing queries further. The output of the Vocabulary Query will be cached and used to expand search results with the Vocabulary content.

<details>
<summary>Example of a Vocabulary configuration</summary>

* Vocabulary configuration

```js title="config.js"
module.exports = {
  vocabularies: {
    category: {
      query: ({ language }) => ({
        '@graph': [
          {
            '@id': '?category',
            label: '?categoryLabel',
          },
        ],
        $where: [
          `?vocabulary (skos:member|skos:narrower)* ?category
          OPTIONAL {
            ?category skos:prefLabel ?categoryLabel .
            FILTER(LANG(?categoryLabel) = "${language}")
          }`
        ],
        $langTag: 'hide',
      }),
    },
  },
};
```

* Query

```js
{
  query: {
    '@context': 'http://schema.org/',
    '@graph': [
      {
        '@id': '?id',
        label: '?label',
        category: '?category',
      },
    ],
    '$where': [
      '?id rdfs:label ?label',
      '?id schema:category ?category',
    ],
  },
}
```

* Without a defined Vocabulary, the result would look like:

```json
{
  "@id": "https://d2klab.github.io/Example",
  "label": "Example",
  "category": "https://d2klab.github.io/category/Test"
}
```

* With a defined Vocabulary, the result will be expanded into:

```json
{
  "@id": "https://d2klab.github.io/Example",
  "label": "Example",
  "category": {
    "@id": "https://d2klab.github.io/category/Test",
    "label": "Test category",
    "image": "https://..."
  }
}
```

</details>

## QueryObject {#QueryObject}

A plain JSON or JSON-LD object used by [sparql-transformer](https://github.com/D2KLab/sparql-transformer) for querying.

The list of properties was taken from [sparql-transformer documentation](https://github.com/D2KLab/sparql-transformer#the-root--properties).

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
