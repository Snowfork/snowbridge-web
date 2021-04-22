import React from 'react';
import * as S from './TransactionItem.style';
import { Transaction } from '../../../redux/reducers/transactions';
import PendingTransactionsUI from '../../PendingTransactionsUI';
import FormatAmount from '../../FormatAmount';

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
        <FormatAmount
          amount={transaction.amount}
          decimals={transaction.token.decimals}
        />
        {' '}
        {ethToSnow ? baseTokenSymbol : snowTokenSymbol}
        {' '}
        to
        {' '}
        <FormatAmount
          amount={transaction.amount}
          decimals={transaction.token.decimals}
        />
        {' '}
        {ethToSnow ? snowTokenSymbol : baseTokenSymbol}
      </S.Details>
      {transaction.status}
      <PendingTransactionsUI transaction={transaction} />
    </S.Wrapper>
  );
}

export default TransactionItem;
