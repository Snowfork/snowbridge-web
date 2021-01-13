import React from 'react';
import * as S from './TransactionItem.style';

import {
  Transaction,
  TransactionsState,
} from '../../../redux/reducers/transactions';

import {
  pendingTransactions,
  shortenWalletAddress,
} from '../../../utils/common';
import PendingTransactionsUI from '../../PendingTransactionsUI';

type Props = {
  transaction: Transaction;
  transactionIndex?: number;
};

function TransactionItem({
  transaction,
  transactionIndex, // This index is incase you want to track the item
}: Props): React.ReactElement<Props> {
  return (
    <S.Wrapper>
      <S.Details>
        ({transaction.confirmations} confirmations)
        {shortenWalletAddress(transaction.hash)}
      </S.Details>
      <PendingTransactionsUI transaction={transaction} />
    </S.Wrapper>
  );
}

export default TransactionItem;
