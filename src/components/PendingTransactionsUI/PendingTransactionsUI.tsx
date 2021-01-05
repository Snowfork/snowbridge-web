import React from 'react';
import * as S from './PendingTransactionsUI.style';
import Step from './Step/Step';

type Props = {};

function PendingTransactionsUI({}: Props) {
  return (
    <S.Wrapper>
      <S.Container>
        <Step currentState="complete" />
        <S.StyledLine />
        <Step currentState="loading" />
        <S.StyledLine />
        <Step currentState="waiting" />
        <S.StyledLine />
        <Step currentState="waiting" />
        <S.StyledLine />
        <Step currentState="waiting" />
      </S.Container>
    </S.Wrapper>
  );
}

export default PendingTransactionsUI;
