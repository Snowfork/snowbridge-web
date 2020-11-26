// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import SelectedAccount from './components/SelectedAccount/';
import Net from './net';

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
  polkadotAddress: string;
};

// ------------------------------------------
//               AppETH component
// ------------------------------------------
function AppETH({ net, polkadotAddress }: Props): React.ReactElement<Props> {
  // State
  const [depositAmount, setDepositAmount] = useState(String);

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
          margin: '0 auto',
          padding: '2em 0',
          border: 'thin solid #E0E0E0',
        }}
      >
        <Grid item xs={10}>
          <Typography gutterBottom variant="h5">
            ETH App
          </Typography>
        </Grid>

        {/* SS58 Address Input */}
        <Grid item xs={10}>
          <FormControl>
            <Typography gutterBottom>To</Typography>
            <SelectedAccount address={polkadotAddress} />
          </FormControl>
        </Grid>

        {/* ETH Deposit Amount Input */}
        <Grid item xs={10}>
          <FormControl>
            <Typography gutterBottom>Amount</Typography>
            <TextField
              InputProps={{
                value: depositAmount,
              }}
              id="eth-input-amount"
              margin="normal"
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00 ETH"
              style={{ margin: 5 }}
              variant="outlined"
            />
            <FormHelperText id="ethAmountDesc">
              How much ETH would you like to deposit?
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Send ETH */}
        <Grid item xs={10}>
          {depositAmount.length > 0 ? (
            <Button
              color="primary"
              onClick={() => net?.eth?.send_eth(polkadotAddress, depositAmount)}
              variant="outlined"
            >
              <Typography variant="button">Send ETH</Typography>
            </Button>
          ) : (
            <Button disabled color="primary" variant="outlined">
              <Typography variant="button">Send ETH</Typography>
            </Button>
          )}
        </Grid>
      </Grid>
      <Divider />
    </Grid>
  );
}

export default React.memo(styled(AppETH)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
