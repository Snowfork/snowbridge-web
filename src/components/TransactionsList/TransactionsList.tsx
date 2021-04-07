import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { Button } from '@material-ui/core';
import * as S from './TransactionsList.style';
import LoadingSpinner from '../LoadingSpinner';

import { TransactionsState } from '../../redux/reducers/transactions';

import TransactionItem from './TransactionItem';

const customStyles = {
  overlay: {},
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
  },
};

type Props = {
  transactions: TransactionsState;
};

function TransactionsList({
  transactions: { transactions },
}: Props): React.ReactElement<Props> {
  const [isOpen, setIsOpen] = useState(false);
  const [lastTransactionCount, setLastTransactionCount] = useState(
    transactions.length,
  );
  const noTransactions = transactions.length === 0 || !transactions;
  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }
  // fires when the transaction list is updated
  // check if a new transaction has been added
  // to open the modal
  useEffect(() => {
    if (transactions.length > lastTransactionCount) {
      openModal();
    }
    setLastTransactionCount(transactions.length);
  }, [lastTransactionCount, transactions]);

  function getTransactions() {
    if (noTransactions) {
      return <div>No transactions</div>;
    }
    return (
      <S.List>
        {transactions.map((transaction) => (
          <TransactionItem
            transaction={transaction}
            key={transaction.hash}
          />
        ))}
      </S.List>
    );
  }

  return (
    <div>
      <Button
        variant="contained"
        onClick={openModal}
      >
        Transaction list
        {!noTransactions && <LoadingSpinner spinnerHeight="10px" spinnerWidth="10px" />}
      </Button>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Transactions List"
      >
        <S.Wrapper>
          <S.Heading>Transactions List</S.Heading>
          {getTransactions()}
          <S.Button onClick={closeModal}>Close</S.Button>
        </S.Wrapper>
      </ReactModal>
    </div>
  );
}

export default TransactionsList;
