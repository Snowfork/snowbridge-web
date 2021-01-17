import React from 'react';
import { BLOCK_EXPLORER_URL, REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import {
  Transaction,
  TransactionStatus,
} from '../../redux/reducers/transactions';
import * as S from './PendingTransactionsUI.style';
import Step, { StepStatus } from './Step/Step';

type Props = {
  transaction: Transaction;
};

// returns a StepStatus (pending,loading,complete) according to the transaction status
function getStepStatus(
  transaction: Transaction,
  step: TransactionStatus,
): StepStatus {
  if (transaction.status === step) {
    return StepStatus.LOADING;
  }
  if (transaction.status > step) {
    return StepStatus.COMPLETE;
  }
  return StepStatus.PENDING;
}

function confirmationCount(transaction: Transaction) {
  if (transaction.confirmations === 0) {
    return null;
  }

  return `${transaction.confirmations}/${REQUIRED_ETH_CONFIRMATIONS}`;
}

function getEtherscanLink(transaction: Transaction) {
  return `${BLOCK_EXPLORER_URL}/tx/${transaction.hash}`;
}

function PendingTransactionsUI({ transaction }: Props) {
  return (
    <div>
      <S.Wrapper>
        <S.Container>
          <Step
            href={getEtherscanLink(transaction)}
            toolTip={`Waiting for ${REQUIRED_ETH_CONFIRMATIONS}`}
            status={transaction.status > TransactionStatus.CONFIRMING
              ? StepStatus.COMPLETE
              : StepStatus.LOADING }
          >
            {confirmationCount(transaction)}
          </Step>
          <S.StyledLine />
          <Step
            status={getStepStatus(
              transaction,
              TransactionStatus.WAITING_FOR_RELAY,
            )}
            toolTip="Relaying to Polkadot"
          />
          <S.StyledLine />
          <Step
            status={getStepStatus(transaction, TransactionStatus.FINALIZED - 1)}
            toolTip="Transaction finalized"
          />
        </S.Container>
      </S.Wrapper>
    </div>
  );
}

export default PendingTransactionsUI;
