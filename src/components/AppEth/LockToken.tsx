// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// General
import React, { useState } from 'react';
import styled from 'styled-components';

// External
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  FormHelperText,
} from '@material-ui/core';

// Local
import { useDispatch, useSelector } from 'react-redux';
import PolkadotAccount from '../PolkadotAccount';
import { Token } from '../../types';
import { RootState } from '../../redux/reducers';
import { lockToken } from '../../redux/actions/transactions';

type LockTokenProps = {
  selectedToken: Token;
  currentTokenAllowance: number;
};

// ------------------------------------------
//           LockToken component
// ------------------------------------------
function LockToken({
  selectedToken,
  currentTokenAllowance,
}: LockTokenProps): React.ReactElement {
  const [depositAmount, setDepositAmount] = useState<number | string>('');
  const [helperText, setHelperText] = useState<string>('');
  const erc20TokenBalance = useSelector((state: RootState) => state.ERC20Transactions.balance);
  const { ethBalance } = useSelector((state: RootState) => state.transactions);
  const { polkadotAddress } = useSelector((state: RootState) => state.net);

  const dispatch = useDispatch();

  const isERC20 = selectedToken?.address !== '0x0';

  // return total balance of ETH or ERC20
  const getMaxTokenBalance = () : number => {
    if (isERC20) {
      return erc20TokenBalance as number;
    }
    return Number.parseFloat(ethBalance!) as number;
  };

  const handleLockToken = async () => {
    // check if the user has enough funds
    if (depositAmount > getMaxTokenBalance()) {
      setHelperText('Insufficient funds.');
    } else {
      setHelperText('');
      dispatch(lockToken(
        depositAmount.toString(),
        selectedToken,
        polkadotAddress!,
      ));
    }
  };

  // Render
  return (
    <Box display="flex" flexDirection="column">
      <Grid item xs={10}>
        <FormControl>
          <PolkadotAccount address={polkadotAddress!} />
        </FormControl>
        <FormHelperText id="ethAmountDesc">
          Polkadot Receiving Address
        </FormHelperText>
      </Grid>
      <Box padding={1} />
      <FormControl>
        <Typography gutterBottom>Amount</Typography>
        <FormHelperText>
          MAX:
          {' '}
          {getMaxTokenBalance()}
        </FormHelperText>
        <TextField
          error={!!helperText}
          helperText={helperText}
          InputProps={{
            value: depositAmount,
          }}
          id="token-input-amount"
          type="number"
          margin="normal"
          onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : '')}
          placeholder={`0.00 ${selectedToken?.symbol}`}
          style={{ margin: 5 }}
          variant="outlined"
        />
        <FormHelperText id="ethAmountDesc">
          How much
          {' '}
          {selectedToken.symbol}
          {' '}
          would you like to deposit?
        </FormHelperText>
      </FormControl>
      <Box alignItems="center" display="flex" justifyContent="space-around">
        {isERC20 && (
        <Box>
          <Typography>
            Current
            {' '}
            {selectedToken.symbol}
            {' '}
            allowance for bridge:
            {' '}
            {Number(currentTokenAllowance).toFixed(18)}
            {' '}
            {selectedToken.symbol}
          </Typography>
        </Box>
        )}
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
            disabled={isERC20 && currentTokenAllowance === 0}
            fullWidth
            onClick={() => handleLockToken()}
            variant="outlined"
          >
            <Typography variant="button">Send</Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default styled(LockToken)`
`;
