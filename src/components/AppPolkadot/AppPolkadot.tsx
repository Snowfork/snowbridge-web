import React, { useState } from 'react';
import styled from 'styled-components';
import * as S from './AppPolkadot.style';
import Net from '../../net';
import { shortenWalletAddress } from '../../utils/common';

import {
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  FormHelperText,
  Divider,
} from '@material-ui/core';

import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import IconButton from '../IconButton';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  handleSwap: any;
  children?: JSX.Element | JSX.Element[];
};

// ------------------------------------------
//               AppPolkadot component
// ------------------------------------------
function AppPolkadot({
  net,
  handleSwap,
  children,
}: Props): React.ReactElement<Props> {
  // State
  const [depositAmount, setDepositAmount] = useState(String);

  const handleClick = () => {
    handleSwap();
  };

  function SendButton() {
    if (Number(depositAmount) > 0) {
      return (
        <Button
          color="primary"
          onClick={() => net?.polkadot?.burn_polkaeth(depositAmount)}
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
          <Typography gutterBottom variant="h5">
            <S.HeadingContainer>
              Eth
              <IconButton
                primary
                style={{ marginLeft: '10px' }}
                icon={<FaLongArrowAltLeft size="2.5em" />}
                onClick={handleClick}
              />
              <IconButton
                style={{ marginRight: '10px' }}
                icon={<FaLongArrowAltRight size="2.5em" />}
                onClick={handleClick}
              />
              Polkadot
            </S.HeadingContainer>
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
              placeholder="0.00 PolkaETH"
              style={{ margin: 5 }}
              variant="outlined"
            />
            <FormHelperText id="polkaethAmountDesc">
              How much PolkaETH would you like to burn and convert to ETH?
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
