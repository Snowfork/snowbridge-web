import React from 'react';
import { decimals, symbols } from 'asset-transfer-sdk/lib/utils';
import { Transaction } from 'asset-transfer-sdk/lib/types';
import * as S from './TransactionItem.style';
import PendingTransactionsUI from '../../PendingTransactionsUI';
import FormatAmount from '../../FormatAmount';

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
