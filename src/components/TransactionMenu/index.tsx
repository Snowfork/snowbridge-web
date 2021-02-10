import React, { useState } from 'react';
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
import { BLOCK_EXPLORER_URL, REQUIRED_ETH_CONFIRMATIONS } from '../../config';

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


export default function TransactionMenu({
  net,
  transactions: { transactions },
}: Props): React.ReactElement<Props> {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <MenuItem key={transaction.hash}>
        <label>
          <small style={{ marginRight: '10em', color: color }}>
            ({transaction.confirmations} confirmations)
          </small>
          {transaction.hash && shortenWalletAddress(transaction.hash)}
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
                <td align="left">
                  <TransactionHash
                    href={`${BLOCK_EXPLORER_URL}/tx/${t.hash}`}
                  >
                    {t.hash}
                  </TransactionHash>
                </td>
                <td align="left">
                  <a href={`${BLOCK_EXPLORER_URL}/address/${t.sender}`}>
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
    </div>
  );
}
