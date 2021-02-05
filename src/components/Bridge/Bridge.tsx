// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import AppEthereum from '../AppEth';
import AppPolkadot from '../AppPolkadot';
import AppERC20 from '../../AppERC20';

import Net from '../../net';

import SelectTokenModal from '../SelectTokenModal';

import * as S from './Bridge.style';
import {
  Typography,
  Grid,
} from '@material-ui/core';

import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import IconButton from '../IconButton';

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
  const [selectedToken, setSelectedToken] = useState('ETH');

  const handleSwap = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      setSwapDirection(SwapDirection.PolkadotToEthereum);
    } else {
      setSwapDirection(SwapDirection.EthereumToPolkadot);
    }
  };

  const ChainApp = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      return <AppEthereum net={net} handleSwap={handleSwap} />;
    } else {
      return <AppPolkadot net={net} handleSwap={handleSwap} />;
    }
  };

  return (
    <div style={{ padding: '2em 0', }}>
      {/* select direction */}
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
      </Grid>
      <SelectTokenModal setSelectedToken={setSelectedToken} />
      <div style={{ color: '#fff' }}>{selectedToken}</div>
      <ChainApp />
      <AppERC20
        web3={net?.eth?.conn as Web3}
        contract={net?.eth?.erc20_contract as Contract}
        defaultAccount={ethAddress}
      />
    </div>
  );
}

// export default React.memo(styled(Bridge)`
export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
