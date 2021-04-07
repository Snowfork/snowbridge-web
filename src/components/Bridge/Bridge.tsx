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
// import AppPolkadot from '../AppPolkadot';
// import AppETH from '../AppEth';
import EthTokenList from '../AppEth/tokenList.json';
import SelectTokenModal from '../SelectTokenModal';
import { Token } from '../../types';
import { createContractInstance } from '../../redux/actions/ERC20Transactions';
import { RootState } from '../../redux/reducers';
import { fetchPolkadotEthBalance } from '../../redux/actions/transactions';

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
  const [tokens, setTokens] = useState<Token[]>([EthTokenList.tokens[0] as Token]);
  const [selectedAsset, setSelectedAsset] = useState<Token>(tokens[0]);
  const { web3 } = useSelector((state: RootState) => state.net);
  // const currentTokenBalance = useSelector((state: RootState) => state.ERC20Transactions.balance);
  const { ethBalance, polkadotEthBalance } = useSelector((state: RootState) => state.transactions);

  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    const currentChainId = Number.parseInt((web3!.currentProvider as any).chainId, 16);
    // set eth token list
    // only include tokens from current network
    const selectedTokenList = (EthTokenList.tokens as Token[])
      .filter(
        (token: Token) => token.chainId === currentChainId,
      );

    setTokens(selectedTokenList);
    setSelectedAsset(selectedTokenList[0]);
  }, [web3]);

  // update the contract instance when the selected asset changes
  const handleAssetSelected = (asset: Token): void => {
    setSelectedAsset(asset);
    dispatch(createContractInstance(asset.address, web3!));

    // if (swapDirection === SwapDirection.PolkadotToEthereum) {
    dispatch(fetchPolkadotEthBalance());
    // }
  };

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

  const getSourceNetworkTokenBalance = (direction: SwapDirection, token: Token) => {
    // native eth asset
    if (token.address === '0x0') {
      // return eth on ethereum balance
      if (direction === SwapDirection.EthereumToPolkadot) {
        return ethBalance;
      }
      return polkadotEthBalance;
    }

    return 0;
  };

  const getDestinationNetworkTokenBalance = (direction: SwapDirection, token: Token) => {
    // native eth asset
    if (token.address === '0x0') {
      // return eth on polkadot balance
      if (direction === SwapDirection.EthereumToPolkadot) {
        return polkadotEthBalance;
      }
      return ethBalance;
    }

    return 0;
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
                  {selectedAsset?.name}
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
                  {getSourceNetworkTokenBalance(swapDirection, selectedAsset)}
                  {' '}
                  {selectedAsset.symbol}
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
                  {getDestinationNetworkTokenBalance(swapDirection, selectedAsset)}
                  {' '}
                  {selectedAsset.symbol}
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
        tokens={tokens}
        onTokenSelected={handleAssetSelected}
        open={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
      />

    </div>

  // <div style={{ padding: '2em 0', }}>
  //   {/* select swap direction */}
  //   <Grid
  //     container
  //     item
  //     xs={10}
  //     md={8}
  //     justify="center"
  //     spacing={3}
  //     style={{
  //       background: 'white',
  //       margin: '0 auto',
  //       padding: '2em 0',
  //       border: 'thin solid #E0E0E0',
  //     }}
  //   >
  //     <Typography gutterBottom variant="h5">
  //       <S.HeadingContainer>
  //         Eth
  //           <IconButton
  //           primary={swapDirection === SwapDirection.PolkadotToEthereum}
  //           style={{ marginLeft: '10px' }}
  //           icon={<FaLongArrowAltLeft size="2.5em" />}
  //           onClick={() => handleSwap()}
  //         />
  //         <IconButton
  //           primary={swapDirection === SwapDirection.EthereumToPolkadot}
  //           style={{ marginRight: '10px' }}
  //           icon={<FaLongArrowAltRight size="2.5em" />}
  //           onClick={() => handleSwap()}
  //         />
  //           Polkadot
  //         </S.HeadingContainer>
  //     </Typography>
  //     <Box marginLeft="10%">
  //       <Typography gutterBottom display="block">Select Asset</Typography>
  //       <Button onClick={() => setShowAssetSelector(true)}>
  //         <img src={selectedAsset?.logoURI}
  //  alt = {`${selectedAsset?.name} icon`
  // } style = {{ width: '25px' }} />
  //         {selectedAsset?.symbol}
  //       </Button>
  //     </Box>
  //     <SelectTokenModal tokens={tokens}
  //  onTokenSelected={handleAssetSelected}
  // open = { showAssetSelector } onClose = {() => setShowAssetSelector(false)
  // } />
  //   </Grid>
  //   <ChainApp />

  // </div>

  );
}

// export default React.memo(styled(Bridge)`
export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
