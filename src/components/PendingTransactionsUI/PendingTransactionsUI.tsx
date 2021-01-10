import React from 'react';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
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

function confirmationCount(transaction: Transaction) {
  if (transaction.confirmations === 0) {
    return null
  }

  return `${transaction.confirmations}/${REQUIRED_ETH_CONFIRMATIONS}` 
}

function PendingTransactionsUI({transaction}: Props) {
  return (
    <S.Wrapper>
      <S.Container>
        <Step status={getStepStatus(transaction, TransactionStatus.SUBMITTING_TO_ETHEREUM)} />
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.WAITING_FOR_CONFIRMATION)} />
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.CONFIRMING)} >
          {confirmationCount(transaction)}
        </Step>
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.WAITING_FOR_RELAY)} />
        <S.StyledLine />
        <Step status={getStepStatus(transaction, TransactionStatus.FINALIZED-1)} />
      </S.Container>
    </S.Wrapper>
  );
}

export default PendingTransactionsUI;
