import styled, { css } from 'styled-components';

const StyledSpinner = styled.svg`
  animation: rotate 1s linear infinite;
  ${({ size = 50 }) =>
    css`
      width: ${size}px;
      height: ${size}px;
    `}

  circle {
    stroke: ${({ color, theme }) => color || theme.colors.primary};
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`;

function Spinner({ size, color, ...props }) {
  return <StyledSpinner size={size} color={color} viewBox="0 0 50 50" {...props}>
    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="2" />
  </StyledSpinner>
}

export default Spinner;
