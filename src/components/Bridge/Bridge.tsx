// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import AppEthereum from '../AppEth';
import AppPolkadot from '../AppPolkadot';
import AppERC20 from '../../AppERC20';
import EthTokenList from '../AppEth/tokenList.json'
import PolkadotTokenList from '../AppPolkadot/tokenList.json';
import Net from '../../net';


import * as S from './Bridge.style';
import {
  Typography,
  Grid,
} from '@material-ui/core';

import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import IconButton from '../IconButton';
import Button from '../Button'
import SelectTokenModal from '../SelectTokenModal';
import { Token } from '../../types';
import { useDispatch } from 'react-redux';
import { createContractInstance } from '../../redux/actions/ERC20Transactions';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  polkadotAddress: string;
  ethAddress: string;
};

enum SwapDirection {
  EthereumToPolkadot,
  PolkadotToEthereum
}

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge({
  net,
  polkadotAddress,
  ethAddress,
}: Props): React.ReactElement<Props> {
  const [swapDirection, setSwapDirection] = useState(SwapDirection.EthereumToPolkadot);
  const [showAssetSelector, setShowAssetSelector] = useState(true)
  const [tokens, setTokens] = useState<Token[]>([EthTokenList.tokens[0] as Token]);
  const [selectedAsset, setSelectedAsset] = useState<Token>(tokens[0]);
  const dispatch = useDispatch();


  // update token list when the swap direction changes
  useEffect(() => {
    const currentChainId = Number.parseInt((net.eth?.conn?.currentProvider as any).chainId, 16)
    let selectedTokenList: Token[];
    // set eth token list
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      // only include tokens from current network
      selectedTokenList = (EthTokenList.tokens as Token[])
        .filter(
          (token: Token) => token.chainId === currentChainId)
    } else {
      // set polkadot token list
      selectedTokenList = PolkadotTokenList.tokens as Token[]
    }

    setTokens(selectedTokenList);
    setSelectedAsset(selectedTokenList[0]);

  }, [net.eth, setTokens, swapDirection])

  // update the contract instance when the selected asset changes
  useEffect(() => {
    console.log('updating contract instance', selectedAsset)
    if (selectedAsset.address !== '0x0') {
      dispatch(createContractInstance(selectedAsset.address, net?.eth?.conn as Web3))
    }
  }, [dispatch, net, selectedAsset])


  const handleSwap = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      setSwapDirection(SwapDirection.PolkadotToEthereum);
    } else {
      setSwapDirection(SwapDirection.EthereumToPolkadot);
    }
  };

  const ChainApp = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      // check if should use eth app or erc20 app
      if (selectedAsset.address === '0x0') {
        return <AppEthereum net={net} handleSwap={handleSwap} />;
      } else {
        return <AppERC20
          net={net}
          contract={net?.eth?.erc20_contract as Contract}
          defaultAccount={ethAddress}
          selectedToken={selectedAsset}
        />
      }
    } else {
      return <AppPolkadot net={net} handleSwap={handleSwap} />;
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
          <Typography gutterBottom>Select Asset</Typography>
          <Button onClick={() => setShowAssetSelector(true)}>
            <img src={selectedAsset.logoURI} alt={`${selectedAsset.name} icon`} style={{ width: '25px' }} />
            {selectedAsset.symbol}
          </Button>
          <SelectTokenModal tokens={tokens} onTokenSelected={setSelectedAsset} open={showAssetSelector} onClose={() => setShowAssetSelector(false)} />
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
