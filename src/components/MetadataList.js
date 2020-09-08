import { Metadata } from '@components';
import { uriToId } from '@helpers/utils';
import { useTranslation } from '~/i18n';
import config from '~/config';

/**
 * Metadata list.
 */

function generateValue(currentRouteName, currentRoute, metaName, meta) {
  if (typeof meta !== 'object') {
    if (['http://', 'https://'].some((protocol) => meta.startsWith(protocol))) {
      return (
        <a href={meta} target="_blank" rel="noopener noreferrer">
          {meta}
        </a>
      );
    }
    return <>{meta}</>;
  }

  const [routeName, route] =
    Object.entries(config.routes).find(([, r]) => {
      if (Array.isArray(r.rdfType)) {
        return r.rdfType.includes(meta['@type']);
      }
      if (typeof r.rdfType === 'string') {
        return r.rdfType === meta['@type'];
      }
      return false;
    }) || [];
  const isKnownType = typeof type !== 'undefined';

  let url = meta['@id'];
  if (route) {
    url = `/${routeName}/${encodeURIComponent(uriToId(meta['@id'], { base: route.uriBase }))}`;
  } else if (
    currentRoute &&
    Array.isArray(currentRoute.filters) &&
    currentRoute.filters.find((f) => f.id === metaName)
  ) {
    url = `/${currentRouteName}?field_filter_${metaName}=${encodeURIComponent(meta['@id'])}`;
  }

  let printableValue = '<unk>';
  if (typeof meta.label === 'object') {
    // If $langTag is set to 'show' in sparql-transformer
    printableValue = meta.label['@value'];
  } else if (typeof meta.label === 'string') {
    // Example: {"@id":"http://data.silknow.org/collection/ec0f9a6f-7b69-31c4-80a6-c0a9cde663a5","@type":"http://erlangen-crm.org/current/E78_Collection","label":"European Sculpture and Decorative Arts"}
    printableValue = meta.label;
  } else {
    // Example: {"@id":"Textiles"}
    printableValue = meta['@id'];
    url = null;
  }

  if (!url) {
    return <>{printableValue}</>;
  }

  return (
    <a
      href={url}
      target={isKnownType ? '_self' : '_blank'}
      rel={isKnownType ? '' : 'noopener noreferrer'}
    >
      {printableValue}
    </a>
  );
}

const MetadataList = ({ metadata, query, route }) => {
  const { t } = useTranslation();

  return (
    <>
      {metadata.flatMap(([metaName, meta]) => {
        const values = [];
        if (Array.isArray(meta)) {
          /* Example:
            [
              { '@id': { '@language': 'en', '@value': 'linen' } },
              { '@id': 'http://data.silknow.org/vocabulary/277', label: [ { '@language': 'en', '@value': 'silk thread' } ] }
            ]
          */
          meta.forEach((subMeta) => {
            const value = generateValue(query.type, route, metaName, subMeta);
            if (value) {
              values.push(value);
            }
          });
        } else if (typeof meta['@id'] === 'object') {
          // Example: { '@id': { '@language': 'en', '@value': 'hand embroidery' } }
          values.push(<span>{meta['@id']['@value']}</span>);
        } else {
          // Example: { '@id': 'http://data.silknow.org/collection/4051dfc9-1267-3530-bac8-40011f2e3daa', '@type': 'E78_Collection', label: 'Textiles and Fashion Collection' }
          const value = generateValue(query.type, route, metaName, meta);
          if (value) {
            values.push(value);
          }
        }

        return (
          <Metadata key={metaName} label={t(`metadata.${metaName}`)}>
            {values.map((value, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i}>{value}</div>
            ))}
          </Metadata>
        );
      })}
    </>
  );
};

export default MetadataList;
