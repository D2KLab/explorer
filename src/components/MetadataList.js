import Metadata from '@components/Metadata';
import Prediction from '@components/Prediction';
import { uriToId } from '@helpers/utils';
import { findRouteByRDFType } from '@helpers/explorer';
import { useTranslation } from 'next-i18next';
import config from '~/config';
import theme from '~/theme';

/**
 * Metadata list.
 */

function generateValue(
  currentRouteName,
  currentRoute,
  metadata,
  metaName,
  metaIndex,
  meta
) {
  // Ignore empty meta objects
  if (typeof meta === 'object' && Object.keys(meta).length === 0) {
    return undefined;
  }

  let skosmosUri = null;
  let url = null;
  let printableValue = '<unk>';

  if (typeof meta === 'object') {
    const [routeName, route] = findRouteByRDFType(meta['@type']);
    const filter =
      currentRoute &&
      Array.isArray(currentRoute.filters) &&
      currentRoute.filters.find((f) => f.id === metaName);

    url = meta['@id'];
    if (route) {
      url = `/${routeName}/${encodeURI(uriToId(meta['@id'], { base: route.uriBase }))}`;
    } else if (filter) {
      url = `/${currentRouteName}?field_filter_${metaName}=${encodeURIComponent(meta['@id'])}`;
      if (filter.hasSkosmosDefinition) {
        skosmosUri = meta['@id'];
      }
    }

    if (Array.isArray(meta.label)) {
      printableValue = meta.label.join(', ');
    } else if (typeof meta.label === 'object') {
      // If $langTag is set to 'show' in sparql-transformer
      printableValue = meta.label['@value'];
    } else if (typeof meta.label === 'string') {
      // Example: {"@id":"http://data.silknow.org/collection/ec0f9a6f-7b69-31c4-80a6-c0a9cde663a5","@type":"http://erlangen-crm.org/current/E78_Collection","label":"European Sculpture and Decorative Arts"}
      printableValue = meta.label;
    } else {
      printableValue = meta['@id'];
      url = null;
    }
  } else {
    printableValue = meta;
    if (['http://', 'https://'].some((protocol) => meta.startsWith(protocol))) {
      url = meta;
    }
  }

  if (currentRoute.metadata && typeof currentRoute.metadata[metaName] === 'function') {
    printableValue = currentRoute.metadata[metaName](printableValue, metaIndex, metadata);
  }

  if (!url && !printableValue) {
    return undefined;
  }

  const isPredicted = typeof meta.score !== 'undefined';



  function renderValue(score) {
    const prediction = isPredicted && <Prediction score={score} />;

    if (!url) {
      return <>{printableValue}{prediction}</>;
    }

    return (
      <>
        <a
          href={url}
          style={isPredicted ? { color: theme.colors.prediction, fontStyle: 'italic' } : {}}
        >
          {printableValue}
        </a>
        {prediction}
        {skosmosUri && config.plugins.skosmos && (
          <small>
            {metaName} (
            <a
              href={`${config.plugins.skosmos.baseUrl}${meta['@id']}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              def
            </a>
            )
          </small>
        )}
      </>
    );
  }

  if (isPredicted) {
    const scores = Array.isArray(meta.score) ? meta.score : [meta.score];
    return <ul>{scores.map(score => (<li>{renderValue(score)}</li>))}</ul>;
  }

  return renderValue();
}

const MetadataList = ({ metadata, query, route }) => {
  const { t } = useTranslation('project');

  const displayedMetadata = Object.entries(metadata).filter(([metaName]) => {
    if (['@id', '@type', '@graph', 'label', 'representation', 'legalBody'].includes(metaName))
      return false;
    if (Array.isArray(route.details.excludedMetadata)) {
      return !route.details.excludedMetadata.includes(metaName);
    }
  });

  return (
    <>
      {displayedMetadata.flatMap(([metaName, meta], index) => {
        const values = [];
        if (Array.isArray(meta)) {
          /* Example:
            [
              { '@id': { '@language': 'en', '@value': 'linen' } },
              { '@id': 'http://data.silknow.org/vocabulary/277', label: [ { '@language': 'en', '@value': 'silk thread' } ] }
            ]
          */
          meta.forEach((subMeta, i) => {
            const value = generateValue(
              query.type,
              route,
              metadata,
              metaName,
              i,
              subMeta
            );
            if (value) {
              values.push(value);
            }
          });
        } else if (typeof meta['@id'] === 'object') {
          // Example: { '@id': { '@language': 'en', '@value': 'hand embroidery' } }
          values.push(<span>{meta['@id']['@value']}</span>);
        } else {
          // Example: { '@id': 'http://data.silknow.org/collection/4051dfc9-1267-3530-bac8-40011f2e3daa', '@type': 'E78_Collection', label: 'Textiles and Fashion Collection' }
          const value = generateValue(
            query.type,
            route,
            metadata,
            metaName,
            index,
            meta
          );
          if (value) {
            values.push(value);
          }
        }

        if (!values.length) {
          // Do not display the metadata if there's no values
          return undefined;
        }

        return (
          <Metadata key={metaName} label={t(`metadata.${metaName.replace(/__/, '')}`)}>
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
