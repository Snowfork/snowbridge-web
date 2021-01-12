import React, { useState, useEffect, ReactNode } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from '../Modal';
import styled from 'styled-components';
import {
  Transaction,
  TransactionsState,
} from '../../redux/reducers/transactions';
import Net from '../../net';
import { pendingTransactions, shortenWalletAddress } from '../../utils/common';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import PendingTransactionsUI from '../PendingTransactionsUI';

type Props = {
  net: Net;
  transactions: TransactionsState;
};

const Table = styled.table`
  border: thin solid rgba(0, 0, 0, 0.23);
`;

const TransactionHash = styled.a`
  font-size: 0.8rem;
`;

const TD = styled.td`
  padding: 2em;
  margin: 2em;
`;

export default function TransactionMenu({
  net,
  transactions: { transactions },
}: Props): React.ReactElement<Props> {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    isPendingTransactionUIModalOpen,
    setPendingTransactionUIModalOpen,
  ] = useState(false);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(-1);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Pending Transaction UI
  const openPendingTransactionUIModal = () => {
    setPendingTransactionUIModalOpen(true);
  };

  const closePendingTransactionUIModal = () => {
    setPendingTransactionUIModalOpen(false);
  };

  const handleTransactionClick = (transactionIndex: number) => {
    setCurrentTransactionIndex(transactionIndex);
    openPendingTransactionUIModal();
  };

  // All transactions modal button
  function AllTransactionsBtn() {
    if (transactions.length > 0) {
      return (
        <MenuItem>
          <button onClick={openModal}>All Transactions</button>
        </MenuItem>
      );
    }
    return null;
  }

  // Informs the user when there is 0 Transactions Available
  function ZeroTransactions() {
    if (transactions.length === 0) {
      return <MenuItem>0 Transactions Available!</MenuItem>;
    }
    return null;
  }

  // Menu Item for a Transaction
  //    An index will be passed in each item so the current transaction
  //    can be identified
  function TransactionMenuItem(
    transaction: Transaction,
    transactionIndex: number,
  ) {
    let color: string = 'orange';

    if (transaction.confirmations >= REQUIRED_ETH_CONFIRMATIONS) {
      color = 'green';
    }

    return (
      <MenuItem onClick={() => handleTransactionClick(transactionIndex)}>
        <label>
          <small style={{ marginRight: '10em', color: color }}>
            ({transaction.confirmations} confirmations)
          </small>
          {shortenWalletAddress(transaction.hash)}
        </label>
      </MenuItem>
    );
  }

  // Modal content
  const modalChildren = (
    <div>
      <h3>Transactions</h3>
      <section>
        <Table aria-label="simple table">
          <tr>
            <td align="left">#</td>
            <td align="left">From -&gt; To</td>
            <td align="left">Confirmations</td>
            <td align="left">Amount</td>
          </tr>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.hash}>
                <td scope="row" align="left">
                  <TransactionHash
                    href={`https://ropsten.etherscan.io/tx/${t.hash}`}
                  >
                    {t.hash}
                  </TransactionHash>
                </td>
                <td align="left">
                  <a href={`https://ropsten.etherscan.io/address/${t.sender}`}>
                    <small>{shortenWalletAddress(t.sender)} </small>
                  </a>
                  -&gt;
                  <small> {shortenWalletAddress(t.receiver)}</small>
                </td>
                <td align="center">
                  {t.confirmations >= REQUIRED_ETH_CONFIRMATIONS ? (
                    <span style={{ color: 'green' }}>{t.confirmations}</span>
                  ) : (
                    <span style={{ color: 'red' }}>{t.confirmations}</span>
                  )}
                </td>
                <td align="left">
                  <small>{t.amount}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );

  return (
    <div>
      <button
        aria-controls="simple-menu"
        aria-haspopup="true"
        color="secondary"
        onClick={handleClick}
      >
        Transactions
        {pendingTransactions(transactions) > 0 &&
          ` (${pendingTransactions(transactions)})`}
      </button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <ZeroTransactions />
        {transactions.map((transaction, index) =>
          TransactionMenuItem(transaction, index),
        )}
        <AllTransactionsBtn />
      </Menu>

      <Modal
        children={modalChildren}
        isOpen={isModalOpen}
        buttonText={'Close'}
        closeModal={closeModal}
      />
      {transactions.length > 0 && currentTransactionIndex !== -1 && (
        <PendingTransactionsUI
          transaction={transactions[currentTransactionIndex]}
          isOpen={isPendingTransactionUIModalOpen}
          closeModal={closePendingTransactionUIModal}
        />
      )}
    </div>
  );
}
