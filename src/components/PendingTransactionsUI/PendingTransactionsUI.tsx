import React from 'react';
import * as S from './PendingTransactionsUI.style';
import Step from './Step/Step';

type Props = {};

function PendingTransactionsUI({}: Props) {
  return (
    <S.Wrapper>
      <S.Container>
        <Step />
        <S.StyledLine />
        <Step />
        <S.StyledLine />
        <Step />
        <S.StyledLine />
        <Step />
        <S.StyledLine />
        <Step />
      </S.Container>
    </S.Wrapper>
  );
}

export default PendingTransactionsUI;
