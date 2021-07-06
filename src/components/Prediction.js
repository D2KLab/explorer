import styled from 'styled-components';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
import { QuestionCircle } from '@styled-icons/fa-solid/QuestionCircle';
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

const Prediction = ({ score }) => {
  const tooltipPrediction = useTooltipState();
  return (
    <>
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
      />
      <StyledTooltip {...tooltipPrediction}>
        This prediction was based from textual and visual analysis.
      </StyledTooltip>
    </>
  );
};

export default Prediction;
