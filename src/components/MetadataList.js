import { QuestionCircle } from '@styled-icons/fa-solid/QuestionCircle';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
import styled from 'styled-components';
import Metadata from '@components/Metadata';
import { uriToId } from '@helpers/utils';
import { findRouteByRDFType } from '@helpers/explorer';
import { useTranslation } from '~/i18n';
import config from '~/config';
import theme from '~/theme';

/**
 * Metadata list.
 */

const StyledTooltip = styled(Tooltip)`
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  color: rgb(255, 255, 255);
  background-color: rgba(33, 33, 33, 0.9);
  font-size: 0.8em;
  padding: 0.5rem;
  border-radius: 0.25rem;
  z-index: 999;
`;

function generateValue(
  currentRouteName,
  currentRoute,
  metadata,
  metaName,
  metaIndex,
  meta,
  isPredicted,
  tooltipPrediction
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

  if (!url) {
    return <>{printableValue}</>;
  }

  return (
    <>
      <a
        href={url}
        style={isPredicted ? { color: theme.colors.prediction, fontStyle: 'italic' } : {}}
      >
        {printableValue}
      </a>
      {isPredicted && (
        <>
          {' '}
          <small style={isPredicted ? { color: theme.colors.prediction, fontStyle: 'italic' } : {}}>
            ({Math.floor(meta.score * 100)}%)
          </small>{' '}
          <TooltipReference
            {...tooltipPrediction}
            as={QuestionCircle}
            size={16}
            color={theme.colors.prediction}
            style={{ cursor: 'pointer' }}
          />
          <StyledTooltip {...tooltipPrediction}>
            This prediction was based from textual and visual analysis.
          </StyledTooltip>
        </>
      )}
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

const MetadataList = ({ metadata, query, route }) => {
  const { t } = useTranslation('project');
  const tooltipPrediction = useTooltipState();

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
        const isPredicted = metaName.startsWith('__');

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
              metaName.replace(/__/, ''),
              i,
              subMeta,
              isPredicted,
              tooltipPrediction
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
            metaName.replace(/__/, ''),
            index,
            meta,
            isPredicted,
            tooltipPrediction
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
