// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Typography,
  Grid,
  Paper,
  makeStyles,
  Theme,
  createStyles,
  InputBase,
  Divider,
  useTheme,
  Button,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { formatBalance } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import SelectTokenModal from '../SelectTokenModal';
import { RootState } from '../../redux/reducers';
import {
  setDepositAmount, setShowConfirmTransactionModal, setSwapDirection, updateBalances,
} from '../../redux/actions/bridge';
import { SwapDirection } from '../../types/types';
import ConfirmTransactionModal from '../ConfirmTransactionModal';
import { getNetworkNames } from '../../utils/common';
import { REFRESH_INTERVAL_MILLISECONDS } from '../../config';
import { ethGasBalance } from '../../redux/reducers/transactions';

enum ErrorMessages {
  INSUFFICIENT_BALANCE = 'Insufficient funds',
  INSUFFICIENT_GAS = 'Insufficient gas',
}

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge(): React.ReactElement {
  // state
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const { showConfirmTransactionModal } = useSelector((state: RootState) => state.bridge);
  const { polkadotGasBalance } = useSelector((state: RootState) => state.transactions);
  const ethereumGasBalance = useSelector((state: RootState) => ethGasBalance(state));

  const [errors, setErrors] = useState<{balance?: ErrorMessages, gas?: ErrorMessages}>({
    balance: undefined,
    gas: undefined,
  });

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useSelector((state: RootState) => state.bridge);

  const theme = useTheme();
  const dispatch = useDispatch();

  // utils
  const getTokenBalances = (direction: SwapDirection)
    : { sourceNetwork: string, destinationNetwork: string } => {
    let sourceNetworkBalance = selectedAsset?.balance.polkadot;
    let destinationNetworkBalance = selectedAsset?.balance.eth;

    if (direction === SwapDirection.EthereumToPolkadot) {
      sourceNetworkBalance = selectedAsset?.balance.eth;
      destinationNetworkBalance = selectedAsset?.balance.polkadot;
    }

    return {
      sourceNetwork: formatBalance(sourceNetworkBalance, { forceUnit: '', withSi: false }),
      destinationNetwork: formatBalance(destinationNetworkBalance, { forceUnit: '', withSi: false }),
    };
  };
  // side effects
  // validate deposit amount on update
  useEffect(() => {
    if (
      new BigNumber(depositAmount)
        .isGreaterThan(
          new BigNumber(getTokenBalances(swapDirection).sourceNetwork),
        )
    ) {
      setErrors((errors) => ({ ...errors, balance: ErrorMessages.INSUFFICIENT_BALANCE }));
    } else {
      setErrors((errors) => ({ ...errors, balance: undefined }));
    }
  }, [depositAmount, swapDirection]);

  // poll APIs to keep balances up to date
  useEffect(() => {
    function startPolling() {
      return setInterval(() => {
        dispatch(updateBalances());
      }, REFRESH_INTERVAL_MILLISECONDS);
    }

    const interval = startPolling();

    return () => {
      clearInterval(interval);
    };
  }, []);

  // check the user has enough gas for the transaction
  useEffect(() => {
    let hasEnoughGas;

    // check eth balance for eth -> polkadot transactions
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      hasEnoughGas = Number.parseFloat(ethereumGasBalance) > 0;
    } else {
      // check DOT balance for polkadot -> eth transactions
      hasEnoughGas = Number.parseFloat(polkadotGasBalance) > 0;
    }

    if (!hasEnoughGas) {
      setErrors((errors) => ({ ...errors, gas: ErrorMessages.INSUFFICIENT_GAS }));
    } else {
      setErrors(
        (errors) => ({ ...errors, gas: undefined }),
      );
    }
  }, [swapDirection, selectedAsset, ethereumGasBalance, polkadotGasBalance]);

  const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto',
      maxWidth: 400,
    },
    amountInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto',
      marginBottom: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      margin: '0 auto',
      maxWidth: 500,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    divider: {
      height: 28,
      margin: 4,
    },
    transfer: {
      width: '100%',
    },
    switch: {
      margin: 'auto',
    },
  }));
  const classes = useStyles(theme);

  // Event handlers

  // update transaction direction between chains
  const changeTransactionDirection = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      dispatch(setSwapDirection(SwapDirection.PolkadotToEthereum));
    } else {
      dispatch(setSwapDirection(SwapDirection.EthereumToPolkadot));
    }
  };

  // set deposit amount to balance of current asset
  const handleMaxClicked = () => {
    const amount = getTokenBalances(swapDirection).sourceNetwork;
    dispatch(setDepositAmount(Number.parseFloat(amount)));
  };

  // update deposit amount in redux store
  const handleDepositAmountChanged = (e: any) => {
    dispatch(setDepositAmount(e.target.value));
  };

  // show confirm transaction modal
  const handleTransferClicked = () => {
    dispatch(setShowConfirmTransactionModal(true));
  };

  const errorText = Object.values(errors).filter((e) => e)[0];

  const assetPrice = (selectedAsset?.prices?.usd ?? 0) * depositAmount;
  const isDepositDisabled = !!errorText || depositAmount <= 0;

  return (

    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          {/* From section */}
          <Grid item>
            <Grid item>
              <Typography>FROM</Typography>
              <Typography variant="subtitle1" gutterBottom>
                {getNetworkNames(swapDirection).from}
              </Typography>
            </Grid>
            {/* amount input */}
            <Grid item>
              <Paper className={classes.amountInput}>
                <InputBase
                  className={classes.input}
                  placeholder="0.0"
                  inputProps={{ 'aria-label': '0.0', min: 0 }}
                  value={depositAmount}
                  onChange={handleDepositAmountChanged}
                  type="number"
                />
                <Button size="small" onClick={handleMaxClicked}>MAX</Button>
                <Divider className={classes.divider} orientation="vertical" />
                <Button onClick={() => setShowAssetSelector(true)}>
                  {selectedAsset?.token?.name}
                  <ExpandMoreIcon />
                </Button>
              </Paper>
            </Grid>

            <Grid item container justify="space-between">
              <Typography gutterBottom>
                $
                {assetPrice}
              </Typography>
              <Grid item>
                <Typography gutterBottom variant="caption">
                  Available Balance:
                </Typography>
                <Typography gutterBottom>
                  {
                    selectedAsset
                    && getTokenBalances(swapDirection).sourceNetwork
                  }
                  {' '}
                  {selectedAsset?.token?.symbol}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item className={classes.switch}>
            <Button onClick={changeTransactionDirection}>
              <SwapVerticalCircleIcon height="40px" color="primary" />
            </Button>
            <Typography align="center" variant="caption" display="block">
              Switch
            </Typography>
          </Grid>

          {/* To section */}
          <Grid item container>
            <Grid item>
              <Typography>TO</Typography>
            </Grid>
            <Grid item container justify="space-between">
              <Typography gutterBottom display="block">{getNetworkNames(swapDirection).to}</Typography>
              <Grid item>
                <Typography gutterBottom variant="caption">
                  Available Balance:
                </Typography>
                <Typography gutterBottom>
                  {
                    selectedAsset
                    && getTokenBalances(swapDirection).destinationNetwork
                  }
                  {' '}
                  {selectedAsset?.token?.symbol}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
        <Typography color="error">
          {errorText}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleTransferClicked}
          disabled={isDepositDisabled}
        >
          Transfer
        </Button>

      </Paper>
      <SelectTokenModal
        open={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
      />
      <ConfirmTransactionModal
        open={showConfirmTransactionModal}
      />

    </div>

  );
}

export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
