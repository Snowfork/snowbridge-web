import React from 'react';
import * as S from './TransactionItem.style';
import { Transaction } from '../../../redux/reducers/transactions';
import PendingTransactionsUI from '../../PendingTransactionsUI';

type Props = {
  transaction: Transaction;
};

function TransactionItem({
  transaction,
}: Props): React.ReactElement<Props> {
  const ethToSnow = transaction.chain === 'eth';
  const baseTokenSymbol = transaction.token.symbol;
  const snowTokenSymbol = `Snow${baseTokenSymbol}`;

  return (
    <S.Wrapper>
      <S.Details>
        Bridge
        {' '}
        {transaction.amount}
        {' '}
        {ethToSnow ? baseTokenSymbol : snowTokenSymbol}
        {' '}
        to
        {' '}
        {transaction.amount}
        {' '}
        {ethToSnow ? snowTokenSymbol : baseTokenSymbol}
      </S.Details>
      <PendingTransactionsUI transaction={transaction} />
    </S.Wrapper>
  );
}

export default TransactionItem;
