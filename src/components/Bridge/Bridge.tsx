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
import { useSelector } from 'react-redux';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import AppPolkadot from '../AppPolkadot';
// import AppETH from '../AppEth';
import SelectTokenModal from '../SelectTokenModal';
import { RootState } from '../../redux/reducers';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  selectedEthAccount: string;
};

enum SwapDirection {
  EthereumToPolkadot,
  PolkadotToEthereum
}

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge({
  selectedEthAccount,
}: Props): React.ReactElement<Props> {
  const [swapDirection, setSwapDirection] = useState(SwapDirection.EthereumToPolkadot);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const { selectedAsset } = useSelector((state: RootState) => state.bridge);
  const theme = useTheme();

  // update transaction direction between chains
  const changeTransactionDirection = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      setSwapDirection(SwapDirection.PolkadotToEthereum);
    } else {
      setSwapDirection(SwapDirection.EthereumToPolkadot);
    }
  };

  // const ChainApp = () => {
  //   if (swapDirection === SwapDirection.EthereumToPolkadot) {
  //     return (
  //       <AppETH
  //         selectedToken={selectedAsset}
  //         selectedEthAccount={selectedEthAccount}
  //       />
  //     );
  //   }
  //   return (
  //     <AppPolkadot
  //       selectedToken={selectedAsset}
  //     />
  //   );
  // };

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

  const getNetworkNames = (direction: SwapDirection) => (
    direction === SwapDirection.EthereumToPolkadot
      ? { from: 'Ethereum', to: 'Polkadot' }
      : { from: 'Polkadot', to: 'Ethereum' }
  );

  const getTokenBalances = (direction: SwapDirection)
    : { sourceNetwork: string, destinationNetwork: string } => {
    // native eth asset
    // return eth on ethereum balance
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

  const classes = useStyles(theme);

  return (

    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          {/* From section */}
          <Grid item>
            <Grid item>
              <Typography>FROM</Typography>
              <Typography variant="subtitle1" gutterBottom>{ getNetworkNames(swapDirection).from}</Typography>
            </Grid>
            {/* amount input */}
            <Grid item>
              <Paper className={classes.amountInput}>
                <InputBase
                  className={classes.input}
                  placeholder="0.0"
                  inputProps={{ 'aria-label': '0.0' }}
                />
                <Button size="small">MAX</Button>
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

        <Grid container direction="row">
          <Button
            variant="contained"
            size="large"
            className={classes.transfer}
            color="primary"
          >
            Transfer
          </Button>
        </Grid>

      </Paper>
      <SelectTokenModal
        open={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
      />

    </div>

  );
}

// export default React.memo(styled(Bridge)`
export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
