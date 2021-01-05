import React from 'react';
import styled from 'styled-components';

const CIRCLE_SIZE = 30;

const Wrapper = styled.div`
  border-radius: 50%;
  border: 2px solid black;
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
`;

function Step() {
  return <Wrapper></Wrapper>;
}

export default Step;
