import Metadata from '@components/Metadata';
import Prediction from '@components/Prediction';
import { uriToId } from '@helpers/utils';
import { findRouteByRDFType } from '@helpers/explorer';
import { useTranslation } from 'next-i18next';
import config from '~/config';
import theme from '~/theme';

/**
 * Generates a printable value for the given meta.
 * @param {string} currentRouteName - the name of the current route.
 * @param {string} currentRoute - the current route.
 * @param {object} metadata - the metadata object.
 * @param {string} metaName - the name of the meta.
 * @param {number} metaIndex - the index of the meta.
 * @param {object} meta - the meta object.
 * @returns A React element.
 */
function generateValue(currentRouteName, currentRoute, metadata, metaName, metaIndex, meta) {
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

    const metaId = meta['@id'];
    if (route) {
      url = `/${routeName}/${encodeURI(uriToId(metaId, { base: route.uriBase }))}`;
    } else if (filter) {
      url = `/${currentRouteName}?filter_${metaName}=${encodeURIComponent(metaId)}`;
      if (filter.hasSkosmosDefinition) {
        skosmosUri = metaId;
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
      printableValue = metaId;
      url = null;
    }
  } else {
    printableValue = meta.toString();
    if (['http://', 'https://'].some((protocol) => printableValue.startsWith(protocol))) {
      url = printableValue;
    }
  }

  if (currentRoute.metadata && typeof currentRoute.metadata[metaName] === 'function') {
    printableValue = currentRoute.metadata[metaName](printableValue, metaIndex, metadata);
  }

  if (!url && !printableValue) {
    return undefined;
  }

  const isPredicted = typeof meta.prediction !== 'undefined';

  function renderValue(prediction) {
    const predictionElement = isPredicted && <Prediction prediction={prediction} />;

    if (!url) {
      return (
        <>
          {printableValue}
          {predictionElement}
        </>
      );
    }

    return (
      <>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={isPredicted ? { color: theme.colors.prediction, fontStyle: 'italic' } : {}}
        >
          {printableValue}
        </a>
        {predictionElement}
        {skosmosUri && config.plugins?.skosmos && (
          <small>
            {metaName} (
            <a
              href={`${config.plugins?.skosmos.baseUrl}${meta['@id']}`}
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
    const predictions = Array.isArray(meta.prediction) ? meta.prediction : [meta.prediction];
    return (
      <ul>
        {predictions.map((pred, i) => (
          <li key={i}>{renderValue(pred)}</li>
        ))}
      </ul>
    );
  }

  return renderValue();
}

/**
 * A component that renders a list of metadata.
 * @param {object} metadata - The metadata to render.
 * @param {string} type - The type of metadata to render.
 * @returns A React component.
 */
function MetadataList({ metadata, type }) {
  const { t } = useTranslation('project');

  const route = config.routes[type];
  if (!route) return;

  const displayedMetadata = Object.entries(metadata).filter(([metaName]) => {
    if (['@id', '@type', '@graph', 'label', 'representation'].includes(metaName)) return false;
    if (Array.isArray(route.details.excludedMetadata)) {
      return !route.details.excludedMetadata.includes(metaName);
    }
    return true;
  });

  return (
    <>
      {displayedMetadata.flatMap(([metaName, meta], index) => {
        const values = [];
        const metaId = meta['@id'];
        if (Array.isArray(meta)) {
          /* Example:
            [
              { '@id': { '@language': 'en', '@value': 'linen' } },
              { '@id': 'http://data.silknow.org/vocabulary/277', label: [ { '@language': 'en', '@value': 'silk thread' } ] }
            ]
          */
          meta.forEach((subMeta, i) => {
            const value = generateValue(type, route, metadata, metaName, i, subMeta);
            if (value) {
              values.push(value);
            }
          });
        } else if (typeof metaId === 'object') {
          // Example: { '@id': { '@language': 'en', '@value': 'hand embroidery' } }
          values.push(<span>{metaId['@value']}</span>);
        } else {
          // Example: { '@id': 'http://data.silknow.org/collection/4051dfc9-1267-3530-bac8-40011f2e3daa', '@type': 'E78_Collection', label: 'Textiles and Fashion Collection' }
          const value = generateValue(type, route, metadata, metaName, index, meta);
          if (value) {
            values.push(value);
          }
        }

        if (!values.length) {
          // Do not display the metadata if there's no values
          return undefined;
        }

        return (
          <Metadata key={metaName} label={t(`project:metadata.${metaName.replace(/__/, '')}`)}>
            {values.map((value, i) => (
              <div key={i}>{value}</div>
            ))}
          </Metadata>
        );
      })}
    </>
  );
}

export default MetadataList;
