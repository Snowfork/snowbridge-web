import React, { useState } from 'react';
import styled from 'styled-components';
import { Token } from '../../types';

import {
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  FormHelperText,
  Divider,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers';
import { burnToken } from '../../redux/actions/transactions';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  selectedToken: Token;
};

// ------------------------------------------
//               AppPolkadot component
// ------------------------------------------
function AppPolkadot({
  selectedToken,
}: Props): React.ReactElement<Props> {
  // State
  const [depositAmount, setDepositAmount] = useState(String);
  const { ethAddress } = useSelector((state: RootState) => state.net)
  const {polkadotEthBalance} = useSelector((state: RootState) => state.transactions)


  const dispatch = useDispatch();
  const tokenSymbol = `Snow${selectedToken.symbol}`

  // return total balance of polkaETH or polkaERC20
  const getMaxTokenBalance = (): number => {
    // if (isERC20) {
      // return erc20TokenBalance as number;
    // }
    return Number.parseFloat(polkadotEthBalance!) as number
  }


  function SendButton() {
    if (Number(depositAmount) > 0) {
      return (
        <Button
          color="primary"
          onClick={() => dispatch(burnToken(depositAmount, selectedToken, ethAddress!))}
          variant="outlined"
        >
          <Typography variant="button">Send {tokenSymbol}</Typography>
        </Button>
      );
    } else {
      return (
        <Button disabled color="primary" variant="outlined">
          <Typography variant="button">Send {tokenSymbol}</Typography>
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

        {/* Address Input */}
        <Grid item xs={10}>
          <FormControl>{ethAddress}</FormControl>
          <FormHelperText id="ethReceivingAddress">
            Ethereum Receiving Address
          </FormHelperText>
        </Grid>

        {/* Polkadot Asset Deposit Amount Input */}
        <Grid item xs={10}>
          <FormControl>
            <Typography gutterBottom>Amount</Typography>
            <FormHelperText >
              MAX: {getMaxTokenBalance()}
            </FormHelperText>
            <TextField
              InputProps={{
                value: depositAmount,
              }}
              id="token-input-amount"
              type="number"
              margin="normal"
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder={`0.00 ${tokenSymbol}`}
              style={{ margin: 5 }}
              variant="outlined"
            />
            <FormHelperText id="tokenAmountDesc">
              How much {tokenSymbol} would you like to burn and convert to {selectedToken.symbol}?
            </FormHelperText>
          </FormControl>
        </Grid>
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
