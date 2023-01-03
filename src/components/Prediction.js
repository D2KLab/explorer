import styled from 'styled-components';
import { useDialogState, Dialog, Tooltip, TooltipAnchor, useTooltipState } from 'ariakit';
import { CircleQuestion } from '@styled-icons/fa-solid/CircleQuestion';
import { useTranslation } from 'next-i18next';

import breakpoints from '@styles/breakpoints';
import { generateMediaUrl, linkify } from '@helpers/utils';
import theme from '~/theme';

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

const StyledDialog = styled(Dialog)`
  max-width: 960px;
  max-height: 640px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.28) 0px 8px 28px;
  padding: 32px;
  outline: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const PredictionDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${breakpoints.weirdMedium`
    flex-direction: row;

    img {
      margin-right: 1rem;
    }
  `}
`;

function Prediction({ prediction }) {
  const { t } = useTranslation('project');
  const { score, kind, used, explanation } = prediction;
  const explanations = Array.isArray(explanation) ? explanation : [explanation];

  const dialog = useDialogState({ modal: true });

  const tooltipPrediction = useTooltipState();
  return (
    <>
      <StyledDialog state={dialog} modal aria-label="">
        <PredictionDetails>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={generateMediaUrl(used, 200, 200)} alt="" />
          <p
            dangerouslySetInnerHTML={{
              __html: explanations.map((text) => linkify(text)).join('\n'),
            }}
          />
        </PredictionDetails>
      </StyledDialog>{' '}
      <small style={{ color: theme.colors.prediction, fontStyle: 'italic' }}>
        {Math.floor(score * 100)}%
      </small>{' '}
      <TooltipAnchor
        state={tooltipPrediction}
        as={CircleQuestion}
        size={16}
        color={theme.colors.prediction}
        style={{ cursor: 'pointer' }}
        onClick={() => dialog.show()}
      />
      <StyledTooltip state={tooltipPrediction}>
        {kind === 'http://data.silknow.org/actor/luh-image-analysis/' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}
            src={generateMediaUrl(used, 80, 80)}
            alt=""
          />
        )}{' '}
        {t('project:predictions.text', {
          kind: t(`predictions.kinds.${kind}`, { ns: 'project', nsSeparator: null }),
        })}
      </StyledTooltip>{' '}
      {kind === 'http://data.silknow.org/actor/luh-image-analysis/' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img style={{ verticalAlign: 'middle' }} src={generateMediaUrl(used, 16, 16)} alt="" />
      )}
    </>
  );
}

export default Prediction;
