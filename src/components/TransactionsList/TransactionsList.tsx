import React, { useState } from 'react';
import * as S from './TransactionsList.style';
import ReactModal from 'react-modal';

import { TransactionsState } from '../../redux/reducers/transactions';
import Net from '../../net';

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

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  function getTransactions() {
    if (transactions.length === 0 || !transactions) {
      return <div>No transactions</div>;
    }
    return (
      <S.List>
        {transactions.map((transaction, index) => (
          <TransactionItem transaction={transaction} transactionIndex={index} />
        ))}
      </S.List>
    );
  }

  return (
    <div>
      <button onClick={openModal}>Transaction list</button>
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
