import React from 'react';
import { Typography } from '@material-ui/core';
import * as S from './TransactionsList.style';
import TransactionItem from './TransactionItem';
import { Transaction } from '../../redux/reducers/transactions';

type Props = {
  transactions: Transaction[];
};

function TransactionsList({
  transactions,
}: Props): React.ReactElement<Props> {
  const noTransactions = transactions.length === 0 || !transactions;

  if (noTransactions) {
    return <Typography>No Transactions</Typography>;
  }

  return (
    <S.Wrapper>
      <S.Heading>Transactions List</S.Heading>
      <S.List>
        {transactions.map((transaction) => (
          <TransactionItem
            transaction={transaction}
            key={transaction.hash}
          />
        ))}
      </S.List>
    </S.Wrapper>

  );
}

export default TransactionsList;
