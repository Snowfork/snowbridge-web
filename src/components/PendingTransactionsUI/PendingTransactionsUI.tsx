import React from 'react';
import { Transaction, TransactionStatus } from '../../redux/reducers/transactions';
import * as S from './PendingTransactionsUI.style';
import Step, {StepStatus} from './Step/Step';

type Props = {
  transaction: Transaction
};

// returns a StepStatus (pending,loading,complete) according to the transaction status
function getStepStatus(transaction: Transaction, step: TransactionStatus) : StepStatus {
  if (transaction.status === step) {
    return StepStatus.LOADING;
  }
  if (transaction.status > step) {
    return StepStatus.COMPLETE
  }
  return StepStatus.PENDING
}

function PendingTransactionsUI({transaction}: Props) {
  return (
    <S.Wrapper>
      <S.Container>
        <Step status={getStepStatus(transaction, TransactionStatus.SUBMITTING_TO_ETHEREUM)} />
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.WAITING_FOR_CONFIRMATION)} />
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.CONFIRMED_ON_ETHEREUM)} >
          {transaction.confirmations.toString()}
        </Step>
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.WAITING_FOR_RELAY)} />
        <S.StyledLine />
        <Step status={StepStatus.PENDING} />
      </S.Container>
    </S.Wrapper>
  );
}

export default PendingTransactionsUI;
