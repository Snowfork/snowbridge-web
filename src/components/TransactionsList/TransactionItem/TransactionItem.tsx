import React from 'react';
import * as S from './TransactionItem.style';
import { Transaction } from '../../../redux/reducers/transactions';
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
        Swap { transaction.amount } {transaction.assets.deposited} for {transaction.amount} {transaction.assets.recieved}
      </S.Details>
      <PendingTransactionsUI transaction={transaction} />
    </S.Wrapper>
  );
}

export default TransactionItem;
