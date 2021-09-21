import React from 'react';
import { BLOCK_EXPLORER_URL, REQUIRED_ETH_CONFIRMATIONS } from '../../../../config';
import {
  Transaction,
  TransactionStatus,
} from '../../../../redux/reducers/transactions';
import * as S from './PendingTransactionBubbles.style';
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

function getEtherscanLink(transaction: Transaction) {
  return `${BLOCK_EXPLORER_URL}/tx/${transaction.hash}`;
}

type Step = {
  link?: string,
  toolTip: string,
  subtext?: string,
  status: StepStatus,
};

const calculateNumberOfConfirmations = (transaction: Transaction) => {
  if (transaction.confirmations >= REQUIRED_ETH_CONFIRMATIONS) {
    return REQUIRED_ETH_CONFIRMATIONS;
  } else if (transaction.confirmations > 0) {
    return transaction.confirmations;
  } else {
    return 0;
  }
};

function createSteps(transaction: Transaction) {
  return [{
    link: getEtherscanLink(transaction),
    toolTip: `The transaction is finalizing with ${REQUIRED_ETH_CONFIRMATIONS} confirmations required.`,
    subtext: `${calculateNumberOfConfirmations(transaction)}/${REQUIRED_ETH_CONFIRMATIONS}`,
    status: transaction.status > TransactionStatus.CONFIRMING
      ? StepStatus.COMPLETE
      : StepStatus.LOADING,
  }, {
    toolTip: `A relayer is picking up the finalized transaction and relaying it across`,
    status: getStepStatus(
      transaction,
      TransactionStatus.WAITING_FOR_RELAY,
    ),
  }, {
    toolTip: `The transaction has been relayed and confirmed`,
    status: getStepStatus(transaction, TransactionStatus.DISPATCHED - 1),
  }]
}

function PendingTransactionBubbles({ transaction }: Props): JSX.Element {
  const steps = createSteps(transaction);
  return (
    <div>
      <S.Wrapper>
        <S.Container>
          {steps.map((step, index) => {
            const line = index !== steps.length - 1 ? <S.StyledLine key={`l${index}`} /> : null;
            return <><Step
              key={index}
              link={step.link}
              toolTip={step.toolTip}
              subtext={step.subtext}
              status={step.status}
            />{line}</>
          })}
        </S.Container>
      </S.Wrapper>
    </div>
  );
}

export default PendingTransactionBubbles;
