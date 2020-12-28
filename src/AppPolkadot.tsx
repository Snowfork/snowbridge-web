import React, { useState } from 'react';
import styled from 'styled-components';
import Net from './net';
import { shortenWalletAddress } from '../src/utils/common';

import {
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  FormHelperText,
  Divider,
} from '@material-ui/core';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  children?: JSX.Element | JSX.Element[];
};

// ------------------------------------------
//               AppPolkadot component
// ------------------------------------------
function AppPolkadot({ net, children }: Props): React.ReactElement<Props> {
  // State
  const [depositAmount, setDepositAmount] = useState(String);

  function SendButton() {
    if (Number(depositAmount) > 0) {
      return (
        <Button
          color="primary"
          onClick={() => net?.polkadot?.send_asset(depositAmount)}
          variant="outlined"
        >
          <Typography variant="button">Send Polkadot Asset</Typography>
        </Button>
      );
    } else {
      return (
        <Button disabled color="primary" variant="outlined">
          <Typography variant="button">Send Polkadot Asset</Typography>
        </Button>
      );
    }
  }
  // Render
  return (
    <Grid container>
      <Grid
        container
        item
        xs={10}
        md={8}
        justify="center"
        spacing={3}
        style={{
          background: 'white',
          margin: '0 auto',
          padding: '2em 0',
          border: 'thin solid #E0E0E0',
        }}
      >
        <Grid item xs={10}>
          {children}
          <Typography gutterBottom variant="h5">
            Polkadot App
          </Typography>
        </Grid>

        {/* Address Input */}
        <Grid item xs={10}>
          <FormControl>{shortenWalletAddress(net.ethAddress)}</FormControl>
          <FormHelperText id="ethAmountDesc">
            ETH Receiving Address
          </FormHelperText>
        </Grid>

        {/* Polkadot Asset Deposit Amount Input */}
        <Grid item xs={10}>
          <FormControl>
            <Typography gutterBottom>Amount</Typography>
            <TextField
              InputProps={{
                value: depositAmount,
              }}
              id="eth-input-amount"
              type="number"
              margin="normal"
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00 PolkdotAsset"
              style={{ margin: 5 }}
              variant="outlined"
            />
            <FormHelperText id="polkadotAmountDesc">
              How much PolkadotAsset would you like to deposit?
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Send ETH */}
        <Grid item xs={10}>
          <SendButton />
        </Grid>
      </Grid>
      <Divider />
    </Grid>
  );
}

export default React.memo(styled(AppPolkadot)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
