module.exports = {
  debug: true,
  metadata: {
    title: 'Silknow',
    logo: '/images/silknow-logo.png',
  },
  home: {
    hero: {
      // headline: 'Travel into the Silk Heritage',
      // showLogo: true,
      image: '/images/silknow-hero.png',
    },
  },
  footer: {
    logo: '/images/silknow-footer.png'
  },
  search: {
    allowTextSearch: true,
    textSearchQuery: {
      '@graph': [
        {
          '@id': '?id',
          label: '?label',
          representation: {
            '@id': '?representation',
            image: '?representationUrl$sample',
          },
        },
      ],
      $where: [
        '?id a <http://erlangen-crm.org/current/E22_Man-Made_Object>',
        '?id <http://www.w3.org/2000/01/rdf-schema#label> ?label',
        // Needed because silknow has 2 duplicate images (the source one and the one hosted on silknow.org cloud server)
        // We should only return the silknow.org one
        `OPTIONAL {
          ?id <http://erlangen-crm.org/current/P138i_has_representation> ?representation .
          OPTIONAL {
            ?representation <http://schema.org/contentUrl> ?representationUrl .
            FILTER(STRSTARTS(STR(?representationUrl), "http://silknow.org/"))
          }
        }`
      ],
      $limit: 5,
      $langTag: 'hide',
    },
    allowImageSearch: true,
    placeholderImage: '/images/silknow-placeholder.png',
    languages: {
      en: 'English',
      fr: 'French',
    },
    graphFieldLabel: {
      en: 'Museums',
      fr: 'Musées',
    },
    defaultLanguage: 'en',
  },
  api: {
    endpoint: 'https://data.silknow.org/sparql',
  },
  routes: {
    objects: {
      view: 'browse',
      showInNavbar: true,
      rdfType: 'http://erlangen-crm.org/current/E22_Man-Made_Object',
      details: {
        view: 'gallery',
      },
      filterByGraph: true,
      filters: [
        {
          id: 'technique',
          label: 'Technique',
          isMulti: true,
          query: {
            '@graph': [
              {
                '@id': '?technique',
                label: '?techniqueLabel',
              },
            ],
            $where: [
              '?id a <http://erlangen-crm.org/current/E22_Man-Made_Object>',
              '?production <http://erlangen-crm.org/current/P108_has_produced> ?id',
              '?production <http://erlangen-crm.org/current/P32_used_general_technique> ?technique',
              '?technique <http://www.w3.org/2004/02/skos/core#prefLabel> ?techniqueLabel',
            ],
            $filter: ['lang(?techniqueLabel) = "en"'],
            $langTag: 'hide',
          },
          whereFunc: () => [
            '?production <http://erlangen-crm.org/current/P32_used_general_technique> ?technique',
          ],
          filterFunc: (values) => {
            return [values.map((val) => `?technique = <${val}>`).join(' || ')];
          },
        },
        {
          id: 'material',
          label: 'Material',
          isMulti: true,
          query: {
            '@graph': [
              {
                '@id': '?material',
                label: '?materialLabel',
              },
            ],
            $where: [
              '?id a <http://erlangen-crm.org/current/E22_Man-Made_Object>',
              '?production <http://erlangen-crm.org/current/P108_has_produced> ?id',
              '?production <http://erlangen-crm.org/current/P126_employed> ?material',
              '?material <http://www.w3.org/2004/02/skos/core#prefLabel> ?materialLabel',
            ],
            $filter: ['lang(?materialLabel) = "en"'],
            $langTag: 'hide',
          },
          whereFunc: () => [
            '?production <http://erlangen-crm.org/current/P126_employed> ?material',
          ],
          filterFunc: (values) => {
            return [values.map((val) => `?material = <${val}>`).join(' || ')];
          },
        },
        {
          id: 'composed',
          label: 'Collection',
          isMulti: true,
          query: {
            '@graph': [
              {
                '@id': '?id',
                label: '?label',
              },
            ],
            $where: [
              '?id a <http://erlangen-crm.org/current/E78_Collection>',
              '?id <http://www.w3.org/2000/01/rdf-schema#label> ?label',
            ],
            $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
            $langTag: 'hide',
          },
          whereFunc: () => [
            '?collection <http://erlangen-crm.org/current/P106_is_composed_of> ?id',
          ],
          filterFunc: (values) => {
            return [values.map((val) => `?collection = <${val}>`).join(' || ')];
          },
        },
        {
          id: 'time',
          label: 'Time',
          isMulti: false,
          query: {
            '@graph': [
              {
                '@id': '?id',
                label: '?label',
              },
            ],
            $where: [
              '?production <http://erlangen-crm.org/current/P4_has_time-span> ?id',
              '?id <http://www.w3.org/2004/02/skos/core#prefLabel> ?label'
            ],
            $filter: ['langmatches(lang(?label), "en") || lang(?label) = ""'],
            $langTag: 'hide',
          },
          whereFunc: () => [
            '?production <http://erlangen-crm.org/current/P108_has_produced> ?id',
            '?production <http://erlangen-crm.org/current/P4_has_time-span> ?time',
          ],
          filterFunc: (value) => {
            return [`?time = <${value}>`];
          },
        },
      ],
      labelFunc: (props) => props.label || props.identifier,
      query: {
        '@graph': [
          {
            '@type': 'http://erlangen-crm.org/current/E22_Man-Made_Object',
            '@id': '?id',
            '@graph': '?g',
            label: '$<http://www.w3.org/2000/01/rdf-schema#label>$var:label',
            identifier: '$<http://purl.org/dc/elements/1.1/identifier>$var:identifier',
            representation: {
              '@id': '?representation',
              image: '?representationUrl$sample',
            },
            composed: {
              '@id': '?collection',
              '@type': 'http://erlangen-crm.org/current/E78_Collection',
              label: '?collectionLabel',
            },
            material: {
              '@id': '?material',
              label: '?materialLabel',
            },
            technique: {
              '@id': '?technique',
              label: '?techniqueLabel',
            },
            time: {
              '@id': '?time',
              label: '?timeLabel',
            },
            location: {
              '@id': '?location',
              label: '?locationLabel',
              latitude: '?locationLat',
              longitude: '?locationLong',
              country: '?locationCountry',
            },
          },
        ],
        $where: [
          'GRAPH ?g { ?id a <http://erlangen-crm.org/current/E22_Man-Made_Object> }',
          `OPTIONAL {
            ?collection <http://erlangen-crm.org/current/P106_is_composed_of> ?id .
            ?collection <http://www.w3.org/2000/01/rdf-schema#label> ?collectionLabel .
          }`,
          `OPTIONAL {
            ?production <http://erlangen-crm.org/current/P108_has_produced> ?id .
            OPTIONAL {
              ?production <http://erlangen-crm.org/current/P126_employed> ?material .
              ?material <http://www.w3.org/2004/02/skos/core#prefLabel> ?materialLabel .
              FILTER(LANG(?materialLabel) = "en")
            }
            OPTIONAL {
              ?production <http://erlangen-crm.org/current/P32_used_general_technique> ?technique .
              ?technique <http://www.w3.org/2004/02/skos/core#prefLabel> ?techniqueLabel .
              FILTER(LANG(?techniqueLabel) = "en")
            }
            OPTIONAL {
              ?production <http://erlangen-crm.org/current/P4_has_time-span> ?time .
              ?time <http://www.w3.org/2004/02/skos/core#prefLabel> ?timeLabel .
              FILTER(LANG(?timeLabel) = "en")
            }
            OPTIONAL {
              ?production <http://erlangen-crm.org/current/P8_took_place_on_or_within> ?location .
              ?location <http://www.geonames.org/ontology#name> ?locationLabel .
              FILTER(LANG(?locationLabel) = "en")
              ?location <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?locationLat .
              ?location <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?locationLong .
              ?location <http://www.geonames.org/ontology#parentCountry>/<http://www.geonames.org/ontology#name> ?locationCountry .
            }
          }`,
          // Needed because silknow has 2 duplicate images (the source one and the one hosted on silknow.org cloud server)
          // We should only return the silknow.org one
          `OPTIONAL {
            ?id <http://erlangen-crm.org/current/P138i_has_representation> ?representation .
            OPTIONAL {
              ?representation <http://schema.org/contentUrl> ?representationUrl .
              FILTER(STRSTARTS(STR(?representationUrl), "http://silknow.org/"))
            }
          }`,
        ],
        $langTag: 'hide',
      },
    },
    techniques: {
      view: 'vocabulary',
      backgroundColor: '#16406c',
      textColor: '#ffffff',
      query: {
        '@graph': [
          {
            '@id': '?technique',
            label: '?techniqueLabel',
          },
        ],
        $where: [
          '?production <http://erlangen-crm.org/current/P32_used_general_technique> ?technique',
          '?technique <http://www.w3.org/2004/02/skos/core#prefLabel> ?techniqueLabel',
        ],
        $filter: ['lang(?techniqueLabel) = "en"'],
        $langTag: 'hide',
      },
    },
    materials: {
      view: 'vocabulary',
      backgroundColor: '#335a80',
      textColor: '#ffffff',
      query: {
        '@graph': [
          {
            '@id': '?material',
            label: '?materialLabel',
          },
        ],
        $where: [
          '?production <http://erlangen-crm.org/current/P126_employed> ?material',
          '?material <http://www.w3.org/2004/02/skos/core#prefLabel> ?materialLabel',
        ],
        $filter: ['lang(?materialLabel) = "en"'],
        $langTag: 'hide',
      },
    },
    depictions: {
      view: 'vocabulary',
      backgroundColor: '#5c81a6',
      textColor: '#ffffff',
      query: {
        '@graph': [
          {
            '@id': '?material',
            label: '?materialLabel',
          },
        ],
        $where: [
          '?production <http://erlangen-crm.org/current/P126_employed> ?material',
          '?material <http://www.w3.org/2004/02/skos/core#prefLabel> ?materialLabel',
        ],
        $filter: ['lang(?materialLabel) = "en"'],
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
  graphs: {
    'http://data.silknow.org/met': {
      label: 'Metropolitan Museum of Art',
      icon: '/images/graphs/http-data-silknow-org-met.png'
    },
    'http://data.silknow.org/unipa': {
      label: 'UNIPA',
      icon: '/images/graphs/http-data-silknow-org-unipa.png'
    },
    'http://data.silknow.org/imatex': {
      label: 'CDMT Terrassa',
      icon: '/images/graphs/http-data-silknow-org-imatex.png'
    },
    'http://data.silknow.org/vam': {
      label: 'Victoria and Albert Museum',
      icon: '/images/graphs/http-data-silknow-org-vam.png'
    },
    'http://data.silknow.org/garin': {
      label: 'Garín 1820',
      icon: '/images/graphs/http-data-silknow-org-garin.png'
    },
    'http://data.silknow.org/mad': {
      label: 'Musée des Arts Décoratifs',
      icon: '/images/graphs/http-data-silknow-org-mad.png'
    },
    'http://data.silknow.org/mfa': {
      label: 'Boston Museum of Fine Arts',
      icon: '/images/graphs/http-data-silknow-org-mfa.png'
    },
    'http://data.silknow.org/risd': {
      label: 'Rhode Island School of Design',
      icon: '/images/graphs/http-data-silknow-org-risd.png'
    },
    'http://data.silknow.org/cer': {
      label: 'Red Digital de Colecciones de Museos de España',
      icon: '/images/graphs/http-data-silknow-org-cer.png'
    },
    'http://data.silknow.org/joconde': {
      label: 'Joconde Database of French Museum Collections',
      icon: '/images/graphs/http-data-silknow-org-joconde.png'
    },
    'http://data.silknow.org/mtmad': {
      label: 'Musée des Tissus',
      icon: '/images/graphs/http-data-silknow-org-mtmad.png'
    },
  },
  vocabularies: [
    {
      id: 'technique',
      query: {
        '@graph': [
          {
            '@id': '?technique',
            label: '?techniqueLabel',
          },
        ],
        $where: [
          '?production <http://erlangen-crm.org/current/P32_used_general_technique> ?technique',
          '?technique <http://www.w3.org/2004/02/skos/core#prefLabel> ?techniqueLabel',
        ],
        $filter: ['lang(?techniqueLabel) = "en"'],
        $langTag: 'hide',
      },
    },
  ],
};
