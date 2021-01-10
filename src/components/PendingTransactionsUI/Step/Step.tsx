import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from '../LoadingSpinner';

const CIRCLE_SIZE = 30;

type StyledProps = {
  status: StepStatus
};

export enum StepStatus {
  PENDING,
  HOVERING,
  LOADING,
  COMPLETE
}

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
    props.status === StepStatus.COMPLETE ? 'green' : 'white'};
`;

type Props = {
  status: StepStatus
  children?: object | string | null
};

function stepContent(status: StepStatus, children?: object | string | null) {
  if (status === StepStatus.PENDING) {
    return null
  }
  if (status === StepStatus.LOADING && children) {
    return children
  }
  if (status === StepStatus.LOADING) {
    return <LoadingSpinner/>
  }
}

function Step({ status, children }: Props): React.ReactElement<Props> {
    return (
      <Wrapper
        status={status}
      >
        {stepContent(status, children)}
      </Wrapper>
    );
}

export default Step;
