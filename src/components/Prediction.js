import styled from 'styled-components';
import { useDialogState, Dialog, DialogBackdrop } from 'reakit/Dialog';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
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

const StyledDialogBackdrop = styled(DialogBackdrop)`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.75);
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

const Prediction = ({ prediction }) => {
  const { t } = useTranslation('project');
  const { score, kind, used, explanation } = prediction;
  const explanations = Array.isArray(explanation) ? explanation : [explanation];

  const dialog = useDialogState({ modal: true });

  const tooltipPrediction = useTooltipState();
  return (
    <>
      <StyledDialogBackdrop {...dialog}>
        <StyledDialog
          {...dialog}
          modal
          aria-label=""
        >
          <PredictionDetails>
            <img src={generateMediaUrl(used, 200, 200)} alt="" />
            <p dangerouslySetInnerHTML={{ __html: explanations.map(text => linkify(text)).join('\n') }} />
          </PredictionDetails>
        </StyledDialog>
      </StyledDialogBackdrop>
      {' '}
      <small style={{ color: theme.colors.prediction, fontStyle: 'italic' }}>
        {Math.floor(score * 100)}%
      </small>{' '}
      <TooltipReference
        {...tooltipPrediction}
        as={CircleQuestion}
        size={16}
        color={theme.colors.prediction}
        style={{ cursor: 'pointer' }}
        onClick={() => dialog.show()}
      />
      <StyledTooltip {...tooltipPrediction}>
        {kind === 'http://data.silknow.org/actor/luh-image-analysis/1' && <img style={{ verticalAlign:'middle', marginRight: '0.5rem' }} src={generateMediaUrl(used, 80, 80)} alt="" />}
        {' '}
        {t('project:predictions.text', { kind: t(`predictions.kinds.${kind}`, { ns: 'project', nsSeparator: null }) })}
      </StyledTooltip>
      {' '}
      {kind === 'http://data.silknow.org/actor/luh-image-analysis/1' && <img style={{ verticalAlign:'middle' }} src={generateMediaUrl(used, 16, 16)} alt="" />}

    </>
  );
};

export default Prediction;
