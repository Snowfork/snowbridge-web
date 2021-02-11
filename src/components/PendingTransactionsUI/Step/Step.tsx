import React, { useState } from 'react';
import styled from 'styled-components';
import LoadingSpinner from '../../LoadingSpinner';

const CIRCLE_SIZE = 30;

type StyledProps = {
  status: StepStatus;
};

export enum StepStatus {
  PENDING,
  HOVERING,
  LOADING,
  COMPLETE,
}

const Wrapper = styled.div<StyledProps>`
  border-radius: 50%;
  border: 2px solid black;
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  box-sizing: border-box;
  background-color: ${(props) =>
    props.status === StepStatus.COMPLETE ? 'green' : 'white'};
`;

const Link = styled.a`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const ToolTip = styled.div<{ show: boolean }>`
  position: absolute;
  background: white;
  color: black;
  border: 1px solid black;
  width: fit-content;
  opacity: ${({ show }) => (show ? 1 : 0)};
  z-index: 999;
`;

type Props = {
  status: StepStatus;
  href?: string;
  toolTip?: object | string | null;
  children?: object | string | null;
};

function stepContent(status: StepStatus, children?: object | string | null) {
  if (status === StepStatus.PENDING) {
    return null;
  }
  if (status === StepStatus.LOADING && children) {
    return children;
  }
  if (status === StepStatus.LOADING) {
    return <LoadingSpinner />;
  }
}

function Step({
  status,
  children,
  href,
  toolTip,
}: Props): React.ReactElement<Props> {
  let [showToolTip, setShowToolTip] = useState(false);

  return (
    <Wrapper status={status}>
      <Link
        href={href}
        target="_blank"
        onMouseOver={() => setShowToolTip(true)}
        onMouseOut={() => setShowToolTip(false)}
      >
        {stepContent(status, children)}
        <ToolTip show={showToolTip}>{toolTip}</ToolTip>
      </Link>
    </Wrapper>
  );
}

export default Step;
