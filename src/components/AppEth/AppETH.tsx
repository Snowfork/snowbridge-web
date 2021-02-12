// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';
// import * as S from './AppEth.style';
import Net from '../../net';
import { Token } from '../../types';
import { Contract } from 'web3-eth-contract';

import {
  Grid,
  Divider,
} from '@material-ui/core';

import AppERC20 from './ERC20';
import LockToken from './LockToken';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  selectedToken: Token;
  bridgeERC20AppContract: Contract;
  selectedEthAccount: string;
  children?: JSX.Element | JSX.Element[];
};

// ------------------------------------------
//               AppETH component
// ------------------------------------------
function AppETH({
  net,
  selectedToken,
  bridgeERC20AppContract,
  selectedEthAccount
}: Props): React.ReactElement<Props> {

  const isERC20 = selectedToken.address !== '0x0';
  let app;
  if (isERC20) {
    app = <AppERC20
      net={net}
      selectedToken={selectedToken}
      bridgeERC20AppContract={bridgeERC20AppContract}
      selectedEthAccount={selectedEthAccount}
    />
  } else {
    app = <LockToken
      net={net}
      selectedToken={selectedToken}
    />;
  }

  // Render
  return (
    <Grid container>
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
        {app}
      </Grid>
      <Divider />
    </Grid>
  );
}

export default React.memo(styled(AppETH)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
