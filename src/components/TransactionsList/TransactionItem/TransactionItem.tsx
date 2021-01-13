import React from 'react';

import {
  Transaction,
  TransactionsState,
} from '../../../redux/reducers/transactions';

import {
  pendingTransactions,
  shortenWalletAddress,
} from '../../../utils/common';

type Props = {
  transaction: Transaction;
  transactionIndex: number;
};

function TransactionItem({
  transaction,
  transactionIndex,
}: Props): React.ReactElement<Props> {
  return (
    <div>
      ({transaction.confirmations} confirmations)
      {shortenWalletAddress(transaction.hash)}
    </div>
  );
}

export default TransactionItem;
