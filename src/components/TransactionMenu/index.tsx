import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Net from '../../net';

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

  // Informs the user when there is 0 Transactions Available
  function ZeroTransactions() {
    if (net.transactions.length == 0) {
      return <MenuItem>0 Transactions Available!</MenuItem>;
    }
    return null;
  }

  return (
    <div>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        color="secondary"
        onClick={handleClick}
      >
        Transactions
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <ZeroTransactions />
        {net.transactions.map((t) => (
          <MenuItem>{shortenWalletAddress(t.hash)}</MenuItem>
        ))}
      </Menu>
    </div>
  );
}
