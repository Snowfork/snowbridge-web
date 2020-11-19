// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import { Box } from '@material-ui/core';

import AppEthereum from './AppETH';
import AppERC20 from './AppERC20';

import Net from './net';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
};

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge({ net }: Props): React.ReactElement<Props> {
  const [ethAddress, setEthAddress] = useState(String);

  useEffect(() => {
    const await_ethAddress = async () => {
      let address = await net?.eth?.get_account();
      if (address) setEthAddress(address);
    };

    await_ethAddress();
  }, [net]);

  return (
    <Box style={{ padding: '2em 0' }}>
      <AppEthereum net={net} />
      <AppERC20
        web3={net?.eth?.conn as Web3}
        contract={net?.eth?.erc20_contract as Contract}
        defaultAccount={ethAddress}
      />
      ;
    </Box>
  );
}

// export default React.memo(styled(Bridge)`
export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
