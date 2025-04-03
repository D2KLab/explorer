module.exports = {
  debug: typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
  metadata: {
    title: 'Exploratory Search Demo',
    logo: '/images/logo.png',
  },
  home: {
    hero: {
      showHeadline: true,
      showLogo: true,
    },
  },
  footer: {
    logo: '/images/footer.png',
  },
  api: {
    endpoint: 'https://dbpedia.org/sparql',
  },
  search: {
    route: 'countries',
    allowTextSearch: true,
    allowImageSearch: false,
    placeholderImage: '/images/placeholder.png',
    languages: {
      en: 'English',
      fr: 'Français',
      es: 'Español',
    },
    graphFieldLabel: {
      en: 'Graph',
      fr: 'Graph',
      es: 'Graph',
    },
    defaultLanguage: 'en',
  },
  routes: {
    countries: {
      view: 'browse',
      showInNavbar: true,
      rdfType: 'http://dbpedia.org/ontology/Country',
      uriBase: 'http://dbpedia.org/resource',
      details: {
        view: 'gallery',
        excludedMetadata: ['description'],
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
              '?country a <http://dbpedia.org/ontology/Country>, <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations> .',
              'FILTER EXISTS { ?country dbo:capital [] }',
              'FILTER NOT EXISTS { ?country <http://dbpedia.org/ontology/dissolutionYear> ?yearEnd }',
              '?country <http://dbpedia.org/ontology/language> ?language',
              '?language rdfs:label ?label',
            ],
            $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
            $langTag: 'hide',
          },
          whereFunc: () => ['?id <http://dbpedia.org/ontology/language> ?language'],
          filterFunc: (val) => `?language = <${val}>`,
        },
        {
          id: 'currency',
          label: 'Currency',
          isMulti: true,
          isSortable: true,
          query: {
            '@graph': [
              {
                '@id': '?currency',
                label: '?label',
              },
            ],
            $where: [
              '?country a <http://dbpedia.org/ontology/Country>, <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations> .',
              'FILTER EXISTS { ?country dbo:capital [] }',
              'FILTER NOT EXISTS { ?country <http://dbpedia.org/ontology/dissolutionYear> ?yearEnd }',
              '?country dbo:currency ?currency',
              '?currency rdfs:label ?label',
            ],
            $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
            $langTag: 'hide',
          },
          whereFunc: () => ['?id dbo:currency ?currency'],
          filterFunc: (val) => `?currency = <${val}>`,
        },
        {
          id: 'governmentType',
          label: 'Government Type',
          isMulti: true,
          isSortable: true,
          query: {
            '@graph': [
              {
                '@id': '?govType',
                label: '?label',
              },
            ],
            $where: [
              '?country a <http://dbpedia.org/ontology/Country>, <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations> .',
              'FILTER EXISTS { ?country dbo:capital [] }',
              'FILTER NOT EXISTS { ?country <http://dbpedia.org/ontology/dissolutionYear> ?yearEnd }',
              '?country dbo:governmentType ?govType',
              '?govType rdfs:label ?label',
            ],
            $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
            $langTag: 'hide',
          },
          whereFunc: () => ['?id dbo:governmentType ?govType'],
          filterFunc: (val) => `?govType = <${val}>`,
        },
      ],
      labelFunc: (props) => props.label || props.identifier,
      baseWhere: [
        `GRAPH ?g {
          ?id a <http://dbpedia.org/ontology/Country>, <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations> .
          FILTER EXISTS { ?id dbo:capital [] }
          FILTER NOT EXISTS { ?id <http://dbpedia.org/ontology/dissolutionYear> [] }
        }`,
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
  graphs: [],
  vocabularies: {},
  plugins: {},
};
