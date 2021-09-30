import React from 'react';
import styled from 'styled-components';

import { BLOCK_EXPLORER_URL, SNOWBRIDGE_EXPLORER_URL, REQUIRED_ETH_CONFIRMATIONS } from '../../../../config';
import {
  Transaction,
  TransactionStatus,
} from '../../../../redux/reducers/transactions';
import Step, { StepStatus } from './Step/Step';

import Line from '../../../Line/Line';

import { Chain } from '../../../../types/types';
import { getChainsFromDirection } from '../../../../utils/common';

type Props = {
  className?: string;
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

function getTransactionLink(chain: Chain, transaction: Transaction) {

  switch (chain) {
    case Chain.ETHEREUM:
      return `${BLOCK_EXPLORER_URL}/tx/${transaction.hash}`;
    case Chain.POLKADOT:
      return `${SNOWBRIDGE_EXPLORER_URL}`;
  }
}

function getSourceTransactionTooltip(chain: Chain) {
  switch (chain) {
    case Chain.ETHEREUM:
      return `The transaction is finalizing with ${REQUIRED_ETH_CONFIRMATIONS} confirmations required.`;
    case Chain.POLKADOT:
      return `The transaction is finalizing on Polkadot.`;
  }
}

function getSourceTransactionSubtext(chain: Chain, transaction: Transaction) {
  switch (chain) {
    case Chain.ETHEREUM:
      return `${calculateNumberOfConfirmations(transaction)}/${REQUIRED_ETH_CONFIRMATIONS}`;
    case Chain.POLKADOT:
      return undefined;
  }
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
  const chains = getChainsFromDirection(transaction.direction);
  const chain = chains.from;
  let status;
  if (transaction.status > TransactionStatus.CONFIRMING) {
    status = StepStatus.COMPLETE;
  } else if (transaction.status === TransactionStatus.REJECTED) {
    status = StepStatus.ERROR;
  } else {
    status = StepStatus.LOADING;
  }

  return [{
    link: getTransactionLink(chain, transaction),
    toolTip: getSourceTransactionTooltip(chain),
    subtext: getSourceTransactionSubtext(chain, transaction),
    status,
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

function PendingTransactionBubbles({ className, transaction }: Props): JSX.Element {
  const steps = createSteps(transaction);
  return (
    <div className={className}>
      {steps.map((step, index) => {
        const line = index !== steps.length - 1 ? <Line key={`l${index}`} /> : null;
        return <><Step
          key={index}
          link={step.link}
          toolTip={step.toolTip}
          subtext={step.subtext}
          status={step.status}
        />{line}</>
      })}
    </div>
  );
}

export default styled(PendingTransactionBubbles)`
  display: flex;
  justify-content: center;
  align-items: center;
`
