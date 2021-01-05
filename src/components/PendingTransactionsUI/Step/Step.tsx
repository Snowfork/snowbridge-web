import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from '../LoadingSpinner';

const CIRCLE_SIZE = 30;

type StyledProps = {
  currentState: string;
};

const Wrapper = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  border-radius: 50%;
  border: 2px solid black;
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  box-sizing: border-box;
  background-color: ${(props) =>
    props.currentState === 'complete' ? 'green' : 'white'};
`;

type Props = {
  currentState: string;
};

function Step({ currentState }: Props): React.ReactElement<Props> {
  if (currentState === 'loading') {
    return (
      <Wrapper currentState={currentState}>
        <LoadingSpinner />
      </Wrapper>
    );
  }
  return <Wrapper currentState={currentState}></Wrapper>;
}

export default Step;
