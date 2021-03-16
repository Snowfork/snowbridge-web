// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import styled from 'styled-components';
// import * as S from './AppEth.style';
import Net from '../../net';
import { Token } from '../../types';

import {
  Grid,
  Divider,
} from '@material-ui/core';

import ERC20Approve from './ERC20Approve';
import LockToken from './LockToken';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers';

import { fetchERC20Allowance, fetchERC20Balance, fetchERC20TokenName } from '../../redux/actions/ERC20Transactions';
import { REFRESH_INTERVAL_MILLISECONDS } from '../../config';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  selectedToken: Token;
  bridgeERC20AppContract: any;
  selectedEthAccount: string;
  children?: JSX.Element | JSX.Element[];
};

// ------------------------------------------
//               AppETH component
// ------------------------------------------
function AppETH({
  net,
  selectedToken,
  selectedEthAccount
}: Props): React.ReactElement<Props> {
  const isERC20 = selectedToken.address !== '0x0';

  const dispatch = useDispatch()
  // Blockchain state from blockchain
  const erc20TokenContract = useSelector((state: RootState) => state.ERC20Transactions.contractInstance)

  const currentTokenAllowance = useSelector((state: RootState) => state.ERC20Transactions.allowance)
  const currentTokenBalance = useSelector((state: RootState) => state.ERC20Transactions.balance)

  useEffect(() => {
    const fetchERC20Data = async () => {
      try {
        dispatch(fetchERC20Allowance(erc20TokenContract, selectedEthAccount))
      } catch (e) {
        console.log('error fetching allowance') 
      }
      try {
        dispatch(fetchERC20Balance(erc20TokenContract, selectedEthAccount))
      } catch (e) {
        console.log('error fetching balance')
      }
      try {
        dispatch(fetchERC20TokenName(erc20TokenContract))
      } catch (e) {
        console.log('error fetching token name')
      }
    };

    if (isERC20) {
      fetchERC20Data();
    }

    const pollTimer = setInterval(() => {
      if (isERC20) {
        fetchERC20Data();
      }
    }, REFRESH_INTERVAL_MILLISECONDS);

    return () => clearInterval(pollTimer);

  }, [erc20TokenContract, selectedEthAccount, isERC20, dispatch]);

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
        {isERC20 && <ERC20Approve
          erc20TokenContract={erc20TokenContract}
          selectedEthAccount={selectedEthAccount}
          selectedToken={selectedToken}
          currentTokenBalance={currentTokenBalance}
        />
        }
        <LockToken
          net={net}
          selectedToken={selectedToken}
          currentTokenAllowance={currentTokenAllowance}
        />
      </Grid>
      <Divider />
    </Grid>
  );
}

export default React.memo(styled(AppETH)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
