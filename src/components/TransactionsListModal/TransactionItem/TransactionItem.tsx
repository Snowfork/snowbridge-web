import React from 'react';
import styled from 'styled-components';
import { Transaction } from '../../../redux/reducers/transactions';
import PendingTransactionsUI from './PendingTransactionBubbles/PendingTransactionBubbles';
import FormatAmount from '../../FormatAmount';
import { decimals, symbols } from '../../../types/Asset';

import { getChainsFromDirection } from '../../../utils/common';

import ChainDisplay from '../../Bridge/TransferPanel/ChainDisplay';

type Props = {
  transaction: Transaction;
  className?: string;
};

function TransactionItem({
  transaction, className
}: Props): React.ReactElement<Props> {
  const chains = getChainsFromDirection(transaction.direction);
  const { from } = decimals(transaction.asset, transaction.direction);
  return (
    <li className={className}>
      <div className="ti-text-div">
        <FormatAmount
          amount={transaction.amount}
          decimals={from}
        />
        {' '}
        {symbols(transaction.asset, transaction.direction).from}{' '}
        from{' '}
        <ChainDisplay mini={true} chain={chains.from} />{' '}
        to{' '}
        <ChainDisplay mini={true} chain={chains.to} />
      </div>
      <PendingTransactionsUI transaction={transaction} />
    </li>
  );
}

export default styled(TransactionItem)`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;

  .ti-text-div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
  }
`;
