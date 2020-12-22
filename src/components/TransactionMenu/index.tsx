import React, { useState, ReactNode } from 'react';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Modal from '../Modal';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

import Net, { Transaction } from '../../net';
import { shortenWalletAddress } from '../../utils/common';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';

type Props = {
  net: Net;
};

export default function TransactionMenu({
  net,
}: Props): React.ReactElement<Props> {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
    if (net.transactions.length > 0) {
      return (
        <MenuItem>
          <Button onClick={openModal}>All Transactions</Button>
        </MenuItem>
      );
    }
    return null;
  }

  // Informs the user when there is 0 Transactions Available
  function ZeroTransactions() {
    if (net.transactions.length === 0) {
      return <MenuItem>0 Transactions Available!</MenuItem>;
    }
    return null;
  }

  // Menu Item for a Transaction
  function TransactionMenuItem(transaction: Transaction) {
    let color: string = 'orange';

    if (transaction.confirmations >= REQUIRED_ETH_CONFIRMATIONS) {
      color = 'green';
    }

    return (
      <MenuItem>
        <Chip
          avatar={
            <small style={{ marginRight: '10em', color: color }}>
              ({transaction.confirmations} confirmations)
            </small>
          }
          label={shortenWalletAddress(transaction.hash)}
        />
      </MenuItem>
    );
  }

  // Modal content
  const modalChildren = (
    <div>
      <h3>Transactions</h3>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">#</TableCell>
              <TableCell align="left">From -&gt; To</TableCell>
              <TableCell align="left">Confirmations</TableCell>
              <TableCell align="left">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {net.transactions.map((t) => (
              <TableRow key={t.hash}>
                <TableCell component="th" scope="row" align="left">
                  <Link href={`https://ropsten.etherscan.io/tx/${t.hash}`}>
                    {t.hash}
                  </Link>
                </TableCell>
                <TableCell align="left">
                  <Link
                    href={`https://ropsten.etherscan.io/address/${t.sender}`}
                  >
                    <small>{shortenWalletAddress(t.sender)} </small>
                  </Link>
                  -&gt;
                  <small> {shortenWalletAddress(t.receiver)}</small>
                </TableCell>
                <TableCell align="left">
                  {t.confirmations >= REQUIRED_ETH_CONFIRMATIONS ? (
                    <span style={{ color: 'green' }}>{t.confirmations}</span>
                  ) : (
                    <span style={{ color: 'red' }}>{t.confirmations}</span>
                  )}
                </TableCell>
                <TableCell align="left">
                  <small>{t.amount}</small>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );

  return (
    <div>
      <Badge color="secondary" badgeContent={net.pendingTransactions()}>
        <Button
          aria-controls="simple-menu"
          aria-haspopup="true"
          color="secondary"
          onClick={handleClick}
        >
          Transactions
        </Button>
      </Badge>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <ZeroTransactions />
        {net.transactions.map((t) => TransactionMenuItem(t))}
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
