// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';

import Net from './net/';

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
};

// ------------------------------------------
//               AppETH component
// ------------------------------------------
function AppETH({ net }: Props): React.ReactElement<Props> {
  // State
  const [polkadotRecipient, setPolkadotRecipient] = useState(String);
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
            <TextField
              InputProps={{
                value: polkadotRecipient,
              }}
              id="eth-input-recipient"
              margin="normal"
              onChange={(e) => setPolkadotRecipient(e.target.value)}
              placeholder={'38j4dG5GzsL1bw...'}
              style={{ margin: 5 }}
              variant="outlined"
            />
            <FormHelperText id="ss58InputDesc">
              What account would you like to fund on Polkadot?
            </FormHelperText>
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
          <Button
            color="primary"
            onClick={() => net?.eth?.send_eth(polkadotRecipient, depositAmount)}
            variant="outlined"
          >
            <Typography variant="button">Send ETH</Typography>
          </Button>
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
