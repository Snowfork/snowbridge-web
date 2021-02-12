// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// General
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Contract } from 'web3-eth-contract';

// External
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  FormControl,
  FormHelperText,
} from '@material-ui/core';

// Local
import * as ERC20Api from '../../utils/ERC20Api';
import PolkadotAccount from '../PolkadotAccount';
import Net from '../../net';
import { Token } from '../../types';

type ERC20LockProps = {
  bridgeERC20AppContract: any;
  erc20TokenContract: any;
  selectedEthAccount: string;
  net: Net;
  selectedToken: Token;
  currentTokenAllowance: Number;
};

// ------------------------------------------
//           ApproveAndLockERC20 component
// ------------------------------------------
function ERC20Lock({
  bridgeERC20AppContract, // the bridge contract
  erc20TokenContract, // the ERC20 token contract
  selectedEthAccount, // the users wallet address
  net,
  selectedToken,
  currentTokenAllowance
}: ERC20LockProps): React.ReactElement {
  const [depositAmount, setDepositAmount] = useState(0);

  const handleLockERC20 = async () => {
    // Lock ERC20 token in bank contract
    await ERC20Api.lockERC20(selectedEthAccount, net.polkadotAddress, erc20TokenContract, bridgeERC20AppContract,
      await ERC20Api.addDecimals(erc20TokenContract, depositAmount))
  };

  // Render
  return (
    <Box>
      <Box>
        <Divider />
        <Box marginTop={'15px'}>
          <Typography gutterBottom variant="h5">
            2. Send
        </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Grid item xs={10}>
            <FormControl>
              <PolkadotAccount address={net.polkadotAddress} />
            </FormControl>
            <FormHelperText id="ethAmountDesc">
              Polkadot Receiving Address
          </FormHelperText>
          </Grid>
          <Box padding={1} />
          <Typography gutterBottom>
            How many {selectedToken.symbol} tokens would you like to deposit
        </Typography>
          <TextField
            InputProps={{
              value: depositAmount,
            }}
            id="token-input-amount"
            margin="normal"
            type="number"
            onChange={(e) => setDepositAmount(Number(e.target.value))}
            placeholder="20"
            style={{ margin: 5 }}
            variant="outlined"
          />
          <Box alignItems="center" display="flex" justifyContent="space-around">
            <Box>
              <Typography>
                Current {selectedToken.symbol} allowance for bridge: {Number(currentTokenAllowance).toFixed(18)} {selectedToken.symbol}
              </Typography>
            </Box>
            <Box
              alignItems="center"
              display="flex"
              height="100px"
              paddingBottom={1}
              paddingTop={2}
              width="300px"
            >
              <Button
                color="primary"
                disabled={currentTokenAllowance === 0}
                fullWidth={true}
                onClick={() => handleLockERC20()}
                variant="outlined"
              >
                <Typography variant="button">Send</Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default styled(ERC20Lock)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
