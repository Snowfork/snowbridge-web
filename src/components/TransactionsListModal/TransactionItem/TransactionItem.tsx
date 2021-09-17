import React from 'react';
import * as S from './TransactionItem.style';
import { Transaction } from '../../../redux/reducers/transactions';
import PendingTransactionsUI from '../PendingTransactions/PendingTransactionsUI';
import FormatAmount from '../../FormatAmount';
import { decimals, symbols } from '../../../types/Asset';

type Props = {
  transaction: Transaction;
};

function TransactionItem({
  transaction,
}: Props): React.ReactElement<Props> {
  const { from } = decimals(transaction.asset, transaction.direction);
  return (
    <S.Wrapper>
      <S.Details>
        Bridge
        {' '}
        <FormatAmount
          amount={transaction.amount}
          decimals={from}
        />
        {' '}
        {symbols(transaction.asset, transaction.direction).from}
        {' '}
        to
        {' '}
        <FormatAmount
          amount={transaction.amount}
          decimals={from}
        />
        {' '}
        {symbols(transaction.asset, transaction.direction).to}
      </S.Details>
      {transaction.status}
      <PendingTransactionsUI transaction={transaction} />
    </S.Wrapper>
  );
}

export default TransactionItem;
