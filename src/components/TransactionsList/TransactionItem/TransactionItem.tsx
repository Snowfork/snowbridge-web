import React from 'react';
import { useSelector } from 'react-redux';
import * as S from './TransactionItem.style';
import { Transaction } from '../../../redux/reducers/transactions';
import PendingTransactionsUI from '../../PendingTransactionsUI';
import FormatAmount from '../../FormatAmount';
import { RootState } from '../../../redux/reducers';
import { symbols } from '../../../types/Asset';

type Props = {
  transaction: Transaction;
};

function TransactionItem({
  transaction,
}: Props): React.ReactElement<Props> {
  const { swapDirection } = useSelector((state: RootState) => state.bridge);

  return (
    <S.Wrapper>
      <S.Details>
        Bridge
        {' '}
        <FormatAmount
          amount={transaction.amount}
          decimals={transaction.asset.decimals}
        />
        {' '}
        {symbols(transaction.asset, swapDirection).from}
        {' '}
        to
        {' '}
        <FormatAmount
          amount={transaction.amount}
          decimals={transaction.asset.decimals}
        />
        {' '}
        {symbols(transaction.asset, swapDirection).to}
      </S.Details>
      {transaction.status}
      <PendingTransactionsUI transaction={transaction} />
    </S.Wrapper>
  );
}

export default TransactionItem;
