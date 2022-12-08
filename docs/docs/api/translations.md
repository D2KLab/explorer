# Translations

Translation files should be placed inside the `public/static/locales/{LANG}` folder, where `{LANG}` is the language key specified in [config.js](config#search-languages).

Translations rely on the framework [i18next](https://www.i18next.com/) and use the same syntax.

## `home.json`

Contains translation keys for the homepage.

```json
{
  "hero": {
    "headline": "Demo Explorer"
  },
  "search": {
    "placeholder": "Search for countries within DBpedia ..."
  },
  "browseBy": "or browse by"
}
```

## `project.json`

Contains translation keys for the project.

<details>
<summary>Full example of <code>project.json</code></summary>

```json
{
  "site": {
    "description": "Description of the Explorer"
  },
  "search": "Search",
  "footer": {
    "text": "This text will appear in the footer. You can use HTML for <strong>effects</strong> and <a href=\"https://www.w3.org/\" target=\"blank\" rel=\"noopener noreferrer\">links</a>."
  },
  "metadata": {
    "@id": "Permalink",
    "description": "Description",
    "language": "Language"
  },
  "routes": {
    "countries": "Countries",
  },
  "routes-descriptions": {
    "countries": "List of countries from DBpedia",
  },
  "filters": {
    "q": "Full text search",
    "language": "Language",
  }
}
```

</details>

### `site`

* `description` - Description of the website, used for `<meta name="description">`.

### `search`

Label of the Search button.

### `footer`

* `text` - Text to display in the footer. HTML is supported for this field.

### `metadata`

Properties in the details page will look for the corresponding key (based on the name of the property in the query) to display their labels.

### `routes`

Label to use for routes in the configuration file, based on the key of the route.

### `routes-descriptions`

Description to use for routes in the configuration file, based on the key of the route.

### `filters`

Filters in the sidebar will look for the corresponding key (based on the [id](/config#route-filters-id) field of the filter) to display their labels.
