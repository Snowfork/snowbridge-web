// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import AppEthereum from './components/AppEth';
import AppPolkadot from './components/AppPolkadot';
import AppERC20 from './AppERC20';

import Net from './net';

import SelectTokenModal from './components/SelectTokenModal';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  polkadotAddress: string;
  ethAddress: string;
};

enum Currencies {
  Eth = 'ETH',
  Polkadot = 'POLKADOT',
}

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge({
  net,
  polkadotAddress,
  ethAddress,
}: Props): React.ReactElement<Props> {
  const [selectedChain, swapChain] = useState(Currencies.Eth);
  const [selectedToken, setSelectedToken] = useState('ETH');

  const handleSwap = () => {
    if (selectedChain === Currencies.Eth) {
      swapChain(Currencies.Polkadot);
    } else {
      swapChain(Currencies.Eth);
    }
  };

  const ChainApp = () => {
    if (selectedChain === Currencies.Polkadot) {
      return <AppEthereum net={net} handleSwap={handleSwap} />;
    } else {
      return <AppPolkadot net={net} handleSwap={handleSwap} />;
    }
  };

  return (
    <div style={{ padding: '2em 0' }}>
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
