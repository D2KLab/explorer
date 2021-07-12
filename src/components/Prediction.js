import styled from 'styled-components';
import { useDialogState, Dialog, DialogBackdrop } from 'reakit/Dialog';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
import { QuestionCircle } from '@styled-icons/fa-solid/QuestionCircle';

import breakpoints from '@styles/breakpoints';
import { generateMediaUrl } from '@helpers/utils';
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
  const { score, kind, used } = prediction;

  const dialog = useDialogState({ modal: true });
  const kindTexts = {
    'http://data.silknow.org/actor/jsi-text-analysis/1': 'text analysis',
    'http://data.silknow.org/actor/luh-image-analysis/1': 'visual analysis',
  };
  const explanationTexts = {
    'http://data.silknow.org/actor/jsi-text-analysis/1': 'Predictions made using a....',
    'http://data.silknow.org/actor/luh-image-analysis/1': `Predictions made using a CNN-based image classification software. Given an input image, the model, available at <a href="https://zenodo.org/record/4742418" target="_blank" rel="noopener noreferrer">https://zenodo.org/record/4742418</a>, is able to predict values for five properties, namely production 'timespan', 'production place', 'technique', 'material' and 'depiction'. It has been trained based on a February 2021 snapshot of the Knowledge Graph. The multi-task learning (MTL) variant is being used in a multi-class classification (mutually exclusive classes) fashion based on the softmax function for computing the class scores.`
  };

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
            <p dangerouslySetInnerHTML={{ __html: explanationTexts[kind] }} />
          </PredictionDetails>
        </StyledDialog>
      </StyledDialogBackdrop>
      {' '}
      <small style={{ color: theme.colors.prediction, fontStyle: 'italic' }}>
        {Math.floor(score * 100)}%
      </small>{' '}
      <TooltipReference
        {...tooltipPrediction}
        as={QuestionCircle}
        size={16}
        color={theme.colors.prediction}
        style={{ cursor: 'pointer' }}
        onClick={() => dialog.show()}
      />
      <StyledTooltip {...tooltipPrediction}>
        {kind === 'http://data.silknow.org/actor/luh-image-analysis/1' && <img style={{ verticalAlign:'middle', marginRight: '0.5rem' }} src={generateMediaUrl(used, 80, 80)} alt="" />}
        {' '}
        This value has been predicted by {kindTexts[kind]}. Click to know more.
      </StyledTooltip>
      {' '}
      {kind === 'http://data.silknow.org/actor/luh-image-analysis/1' && <img style={{ verticalAlign:'middle' }} src={generateMediaUrl(used, 16, 16)} alt="" />}

    </>
  );
};

export default Prediction;
