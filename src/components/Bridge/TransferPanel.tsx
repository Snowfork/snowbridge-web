import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  makeStyles,
  Theme,
  createStyles,
  useTheme,
  Button,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';

import {
  setShowConfirmTransactionModal, setSwapDirection, updateBalances,
} from '../../redux/actions/bridge';
import { SwapDirection } from '../../types/types';

import {
  dotSelector,
  etherSelector,
  tokenBalancesByNetwork,
} from '../../redux/reducers/bridge';
import FormatAmount from '../FormatAmount';
import { getNetworkNames } from '../../utils/common';
import { decimals, symbols } from '../../types/Asset';
import { useAppSelector } from '../../utils/hooks';
import { SelectedFungibleToken } from './SelectedFungibleToken';

const INSUFFICIENT_GAS_ERROR = 'Insufficient gas';

type Props = {
  setShowAssetSelector: (show: boolean) => void,
}

export const TransferPanel = ({ setShowAssetSelector }: Props) => {
  // state
  const tokenBalances = useAppSelector(tokenBalancesByNetwork);
  const dot = useAppSelector(dotSelector);
  const ether = useAppSelector(etherSelector);

  const polkadotGasBalance = dot?.balance?.polkadot;
  const ethereumGasBalance = ether?.balance?.eth;

  const [errors, setErrors] = useState<{ balance?: string, asset?: string }>({
    balance: undefined,
    asset: undefined,
  });

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const theme = useTheme();
  const dispatch = useDispatch();
  const decimalMap = decimals(selectedAsset, swapDirection);

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
      setErrors((errors) => ({ ...errors, gas: INSUFFICIENT_GAS_ERROR }));
    } else {
      setErrors(
        (errors) => ({ ...errors, gas: undefined }),
      );
    }
  }, [swapDirection, selectedAsset, ethereumGasBalance, polkadotGasBalance]);

  const setAssetError = (assetError: string) => {
    setErrors((errors) => ({ ...errors, asset: assetError }));
  }

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

  // show confirm transaction modal
  const handleTransferClicked = () => {
    dispatch(setShowConfirmTransactionModal(true));
  };

  const errorText = Object.values(errors).filter((e) => e)[0];
  const isDepositDisabled = !!errorText
    || Number.parseFloat(depositAmount) <= 0;

  // Event handlers

  // update transaction direction between chains
  const changeTransactionDirection = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      dispatch(setSwapDirection(SwapDirection.PolkadotToEthereum));
    } else {
      dispatch(setSwapDirection(SwapDirection.EthereumToPolkadot));
    }
  };

  return (
    <Grid container spacing={2}>
      {/* From section */}
      <Grid item>
        <Grid item>
          <Typography>FROM</Typography>
          <Typography variant="subtitle1" gutterBottom>
            {getNetworkNames(swapDirection).from}
          </Typography>
        </Grid>
        <SelectedFungibleToken setShowAssetSelector={setShowAssetSelector} setError={setAssetError} />
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
        <Grid item container justifyContent="space-between">
          <Typography gutterBottom display="block">{getNetworkNames(swapDirection).to}</Typography>
          <Grid item>
            <Typography gutterBottom variant="caption">
              Available Balance:
            </Typography>
            <Typography gutterBottom>
              {
                selectedAsset
                && (
                  <FormatAmount
                    amount={tokenBalances.destinationNetwork}
                    decimals={decimalMap.to}
                  />
                )
              }
              {' '}
              {
                selectedAsset && symbols(selectedAsset, swapDirection).to
              }
            </Typography>
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

    </Grid>
  );
};