import React from 'react';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Net, { Transaction } from '../../net';

import { shortenWalletAddress } from '../../utils/common';

type Props = {
  net: Net;
};

export default function TransactionMenu({
  net,
}: Props): React.ReactElement<Props> {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Menu Button to clear Transaction history
  // if transactions are available
  function ClearTransactionsBtn() {
    if (net.transactions.length > 0) {
      return (
        <MenuItem>
          <Button color="secondary" onClick={net.emptyTransactions}>
            Clear Transactions
          </Button>
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

    if (transaction.confirmations >= 12) {
      color = 'green';
    }

    return (
      <MenuItem onClick={handleClose}>
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
        <ClearTransactionsBtn />
        <ZeroTransactions />
        {net.transactions.map((t) => TransactionMenuItem(t))}
      </Menu>
    </div>
  );
}
