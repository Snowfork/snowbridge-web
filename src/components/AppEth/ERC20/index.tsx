// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// General
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Contract } from 'web3-eth-contract';

// External
import {
  Box,
  Typography,
  Divider,
  Grid,
} from '@material-ui/core';

// Local
import { REFRESH_INTERVAL_MILLISECONDS } from '../../../config';
import { RootState } from '../../../redux/reducers';
import { useDispatch, useSelector } from 'react-redux';
import { fetchERC20Allowance, fetchERC20Balance, fetchERC20TokenName } from '../../../redux/actions/ERC20Transactions';
import Net from '../../../net';
import { Token } from '../../../types';

import ERC20Approve from './ERC20Approve';
import LockToken from '../LockToken';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  net: Net;
  selectedToken: Token;
  bridgeERC20AppContract: Contract;
  selectedEthAccount: string;
};

type ApproveAndLockProps = {
  net: Net;
  selectedToken: Token;
  bridgeERC20AppContract: any;
  contractERC20: any;
  selectedEthAccount: string;
};

// ------------------------------------------
//           ApproveAndLockERC20 component
// ------------------------------------------
function ApproveAndLockERC20({
  net,
  selectedToken,
  bridgeERC20AppContract, // the bridge contract
  contractERC20, // the ERC20 token contract
  selectedEthAccount, // the users wallet address
}: ApproveAndLockProps): React.ReactElement<Props> {
  const dispatch = useDispatch()
  // Blockchain state from blockchain
  const allowance = useSelector((state: RootState) => state.ERC20Transactions.allowance)
  const currentTokenBalance = useSelector((state: RootState) => state.ERC20Transactions.balance)

  // queries the contract for allowance and balance
  useEffect(() => {
    const fetchChainData = async () => {
      dispatch(fetchERC20Allowance(contractERC20, selectedEthAccount, bridgeERC20AppContract._address))
      dispatch(fetchERC20Balance(contractERC20, selectedEthAccount))
      dispatch(fetchERC20TokenName(contractERC20))
    };

    fetchChainData();

    const pollTimer = setInterval(() => {
      fetchChainData();
    }, REFRESH_INTERVAL_MILLISECONDS);

    return () => clearInterval(pollTimer);

  }, [bridgeERC20AppContract._address, contractERC20, selectedEthAccount, dispatch]);

  return (
    <div>
      <ERC20Approve
        bridgeERC20AppContract={bridgeERC20AppContract}
        erc20TokenContract={contractERC20}
        selectedEthAccount={selectedEthAccount}
        selectedToken={selectedToken}
        currentTokenBalance={currentTokenBalance}
      />
      <Divider />
      <Box marginTop={'15px'}>
        <Typography gutterBottom variant="h5">
          2. Send
        </Typography>
      </Box>
      <LockToken
        net={net}
        selectedToken={selectedToken}
        currentTokenAllowance={allowance}
      />
    </div>
  );
}

// ------------------------------------------
//               AppERC20 component
// ------------------------------------------
function AppERC20({
  net,
  selectedToken,
  bridgeERC20AppContract,
  selectedEthAccount
}: Props): React.ReactElement<Props> {
  const tokenContract = useSelector((state: RootState) => state.ERC20Transactions.contractInstance)

  if (selectedEthAccount === null || !selectedEthAccount) {
    return <p>Empty Account</p>;
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
          margin: '2em auto',
          padding: '2em 0',
          border: 'thin solid #E0E0E0',
        }}
      >
        {tokenContract && (
          <ApproveAndLockERC20
            bridgeERC20AppContract={bridgeERC20AppContract}
            contractERC20={tokenContract}
            selectedEthAccount={selectedEthAccount}
            net={net}
            selectedToken={selectedToken}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default styled(AppERC20)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
