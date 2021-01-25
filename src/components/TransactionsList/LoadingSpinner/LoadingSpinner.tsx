import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface ISpinnerProps {
  spinnerHeight: string;
  spinnerWidth: string;
}

interface StyledProps {
  borderSize: string;
  spinnerWidth: string;
  spinnerHeight: string;
  mainColor: string;
  accentColor: string;
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
  border: ${(props) => props.borderSize} solid ${(props) => props.mainColor};
  border-top: ${(props) => props.borderSize} solid
    ${(props) => props.accentColor};
  border-radius: 50%;
  width: ${(props) => props.spinnerWidth};
  height: ${(props) => props.spinnerHeight};
  animation: ${spinnerRotate} 2s linear infinite;
`;

const LoadingSpinner: React.FC<ISpinnerProps> = ({
  spinnerHeight = '40%',
  spinnerWidth = '40%',
}) => {
  return (
    <Wrapper
      borderSize="3px"
      spinnerWidth={spinnerWidth}
      spinnerHeight={spinnerHeight}
      mainColor="#868686"
      accentColor="#000000"
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </Wrapper>
  );
};

export default LoadingSpinner;
