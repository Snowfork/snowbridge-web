// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AppPolkadot from '../AppPolkadot';
import AppETH from '../AppEth';
import EthTokenList from '../AppEth/tokenList.json'
import * as S from './Bridge.style';
import {
  Typography,
  Grid,
  Box,
} from '@material-ui/core';

import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import IconButton from '../IconButton';
import Button from '../Button'
import SelectTokenModal from '../SelectTokenModal';
import { Token } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
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
  const [showAssetSelector, setShowAssetSelector] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([EthTokenList.tokens[0] as Token]);
  const [selectedAsset, setSelectedAsset] = useState<Token>(tokens[0]);
  const { web3 } = useSelector((state: RootState) => state.net);

  const dispatch = useDispatch();

  useEffect(() => {
    const currentChainId = Number.parseInt((web3!.currentProvider as any).chainId, 16)
    let selectedTokenList: Token[];
    // set eth token list
    // only include tokens from current network
    selectedTokenList = (EthTokenList.tokens as Token[])
      .filter(
        (token: Token) => token.chainId === currentChainId)

    setTokens(selectedTokenList);
    setSelectedAsset(selectedTokenList[0]);

  }, [web3])

  // update the contract instance when the selected asset changes
  const handleAssetSelected = (asset: Token): void => {
    setSelectedAsset(asset);
    dispatch(createContractInstance(asset.address, web3!));

    // if (swapDirection === SwapDirection.PolkadotToEthereum) {
    dispatch(fetchPolkadotEthBalance())
    // }
  }

  // update transaction direction between chains
  const handleSwap = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      setSwapDirection(SwapDirection.PolkadotToEthereum);
    } else {
      setSwapDirection(SwapDirection.EthereumToPolkadot);
    }
  };

  const ChainApp = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      return <AppETH
        selectedToken={selectedAsset}
        selectedEthAccount={selectedEthAccount}
      />
    } else {
      return <AppPolkadot
        selectedToken={selectedAsset}
      />;
    }
  };

  return (
    <div style={{ padding: '2em 0', }}>
      {/* select swap direction */}
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
        <Typography gutterBottom variant="h5">
          <S.HeadingContainer>
            Eth
              <IconButton
              primary={swapDirection === SwapDirection.PolkadotToEthereum}
              style={{ marginLeft: '10px' }}
              icon={<FaLongArrowAltLeft size="2.5em" />}
              onClick={() => handleSwap()}
            />
            <IconButton
              primary={swapDirection === SwapDirection.EthereumToPolkadot}
              style={{ marginRight: '10px' }}
              icon={<FaLongArrowAltRight size="2.5em" />}
              onClick={() => handleSwap()}
            />
              Polkadot
            </S.HeadingContainer>
        </Typography>
        <Box marginLeft="10%">
          <Typography gutterBottom display="block">Select Asset</Typography>
          <Button onClick={() => setShowAssetSelector(true)}>
            <img src={selectedAsset.logoURI} alt={`${selectedAsset.name} icon`} style={{ width: '25px' }} />
            {selectedAsset.symbol}
          </Button>
        </Box>
        <SelectTokenModal tokens={tokens} onTokenSelected={handleAssetSelected} open={showAssetSelector} onClose={() => setShowAssetSelector(false)} />
      </Grid>
      <ChainApp />

    </div>
  );
}

// export default React.memo(styled(Bridge)`
export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
