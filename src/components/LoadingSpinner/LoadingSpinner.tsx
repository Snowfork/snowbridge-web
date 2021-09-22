import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface ISpinnerProps {
  micro?: boolean;
  spinnerHeight?: string;
  spinnerWidth?: string;
  inverted?: boolean;
}

interface StyledProps {
  borderSize: string;
  micro?: boolean;
  spinnerWidth: string;
  spinnerHeight: string;
  inverted?: boolean;
}

const spinnerRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Wrapper = styled.div<StyledProps>`
  border: ${(props) => props.micro ? '1px' : props.borderSize} solid ${(props) => props.inverted ?
    props.theme.colors.panelBackground : props.theme.colors.main};
  border-top: ${(props) => props.micro ? '1px' : props.borderSize} solid
    ${(props) => props.inverted ? props.theme.colors.main : props.theme.colors.panelBackground};
  border-radius: 50%;
  width: ${(props) => props.spinnerWidth};
  height: ${(props) => props.spinnerHeight};
  animation: ${spinnerRotate} 2s linear infinite;
`;

const LoadingSpinner: React.FC<ISpinnerProps> = ({
  spinnerHeight = '40%',
  spinnerWidth = '40%',
  inverted,
  micro,
}: ISpinnerProps) => (
  <Wrapper
    micro={micro}
    borderSize="3px"
    spinnerWidth={spinnerWidth}
    spinnerHeight={spinnerHeight}
    inverted={inverted}
  >
  </Wrapper>
);

export default styled(LoadingSpinner)`
`;
