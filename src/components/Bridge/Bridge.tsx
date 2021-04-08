// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
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

import SelectTokenModal from '../SelectTokenModal';
import { RootState } from '../../redux/reducers';
import { setDepositAmount, setSwapDirection } from '../../redux/actions/bridge';
import { SwapDirection } from '../../types';
import ConfirmTransactionModal from '../ConfirmTransactionModal';
import { getNetworkNames } from '../../utils/common';

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge(): React.ReactElement {
  // state
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [showConfirmTransactionModal, setShowConfirmTransactionModal] = useState(false);

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useSelector((state: RootState) => state.bridge);

  const theme = useTheme();
  const dispatch = useDispatch();

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

  // utils
  const getTokenBalances = (direction: SwapDirection)
    : { sourceNetwork: string, destinationNetwork: string } => {
    if (direction === SwapDirection.EthereumToPolkadot) {
      return {
        sourceNetwork: selectedAsset!.balance.eth,
        destinationNetwork: selectedAsset!.balance.polkadot,
      };
    }
    return {
      sourceNetwork: selectedAsset!.balance.polkadot,
      destinationNetwork: selectedAsset!.balance.eth,
    };
  };

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
    dispatch(setDepositAmount(Number.parseFloat(amount!)));
  };

  // update deposit amount in redux store
  const handleDepositAmountChanged = (e: any) => {
    dispatch(setDepositAmount(e.target.value));
  };

  // show confirm transaction modal
  const handleTransferClicked = () => {
    setShowConfirmTransactionModal(true);
  };

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
                  inputProps={{ 'aria-label': '0.0' }}
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
              <Typography gutterBottom>$0.00</Typography>
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
                  {selectedAsset?.token.symbol}
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
                  {selectedAsset?.token.symbol}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

        </Grid>

        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleTransferClicked}
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
        onClose={() => setShowConfirmTransactionModal(false)}
      />

    </div>

  );
}

export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
