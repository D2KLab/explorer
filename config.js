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
    textSearchQuery: {
      '@graph': [
        {
          '@id': '?id',
          '@type': '?rdfType',
          label: '?label',
          representation: {
            '@id': '?image$sample',
            image: '?image$sample',
          },
        },
      ],
      $where: [
        '?id a ?rdfType',
        `VALUES ?rdfType {
          <http://dbpedia.org/ontology/Country>
          <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations>
        }`,
        '?id dbo:capital ?capital',
        'FILTER NOT EXISTS { ?id <http://dbpedia.org/ontology/dissolutionYear> ?yearEnd }',
        '?id <http://www.w3.org/2000/01/rdf-schema#label> ?label',
        '?id dbo:thumbnail ?image',
      ],
      $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
      $limit: 5,
      $langTag: 'hide',
    },
    allowImageSearch: false,
    placeholderImage: '/images/placeholder.png',
    languages: {
      en: 'English',
      fr: 'Français',
    },
    graphFieldLabel: {
      en: 'Graph',
      fr: 'Graph',
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
          filterFunc: (values) => {
            return [values.map((val) => `?language = <${val}>`).join(' || ')];
          },
        },
        {
          id: 'show-only-images',
          isOption: true,
          whereFunc: () => [],
        },
      ],
      labelFunc: (props) => props.label || props.identifier,
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
