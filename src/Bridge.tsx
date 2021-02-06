// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import AppEthereum from './AppETH';
import AppPolkadot from './AppPolkadot';
import AppERC20 from './AppERC20';

import Net from './net';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  polkadotAddress: string;
  ethAddress: string;
};

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge({
  net,
  polkadotAddress,
  ethAddress,
}: Props): React.ReactElement<Props> {
  const [selectedChain, swapChain] = useState('ETH');

  const SelectPolkadotApp = (): React.ReactElement => {
    return (
      <select defaultValue="ETH" style={{ float: 'right' }} onChange={handleSwap}>
        <option value="ETH">
          ETH to Polkadot
        </option>
        <option value="POLKADOT">Polkadot to ETH</option>
      </select>
    );
  };

  const SelectEthApp = (): React.ReactElement => {
    return (
      <select style={{ float: 'right' }} onChange={handleSwap}>
        <option value="ETH">ETH to Polkadot</option>
        <option selected value="POLKADOT">
          Polkadot to ETH
        </option>
      </select>
    );
  };

  const handleSwap = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    let val = e.target.value;

    if (val === 'POLKADOT') {
      swapChain('POLKADOT');
    } else {
      swapChain('ETH');
    }
  };

  const ChainApp = () => {
    if (selectedChain === 'POLKADOT') {
      return (
        <AppPolkadot net={net}>
          <SelectEthApp />
        </AppPolkadot>
      );
    } else {
      return (
        <AppEthereum net={net}>
          <SelectPolkadotApp />
        </AppEthereum>
      );
    }
  };

  return (
    <div style={{ padding: '2em 0' }}>
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
