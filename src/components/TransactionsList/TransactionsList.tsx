import React, { useState } from 'react';
import ReactModal from 'react-modal';

import {
  Transaction,
  TransactionsState,
} from '../../redux/reducers/transactions';
import Net from '../../net';

import { pendingTransactions, shortenWalletAddress } from '../../utils/common';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';

import TransactionItem from './TransactionItem';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

type Props = {
  net: Net;
  transactions: TransactionsState;
};

function TransactionsList({
  net,
  transactions: { transactions },
}: Props): React.ReactElement<Props> {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  /* function TransactionItem(transaction: Transaction, transactionIndex: number) {
    return (
      <div>
        ({transaction.confirmations} confirmations)
        {shortenWalletAddress(transaction.hash)}
      </div>
    );
  }
 */

  function getTransactions() {
    if (transactions.length === 0 || !transactions) {
      return <div>No transactions</div>;
    }
    return transactions.map((transaction, index) => (
      <div>
        {/* <TransactionItem transaction={transaction} transactionIndex={index} /> */}
        {/* {TransactionItem(transaction, index)} */}
        {/* <TransactionItem transaction={transaction} transactionIndex={index} /> */}
        <TransactionItem transaction={transaction} transactionIndex={index} />
        {console.log(transaction)}
      </div>
    ));
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
        <button onClick={closeModal}>Click</button>
        TRANSACTIONS LIST
        {getTransactions()}
      </ReactModal>
    </div>
  );
}

export default TransactionsList;
