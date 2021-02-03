// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// General
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

// External
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
} from '@material-ui/core';

// Local
import { REFRESH_INTERVAL_MILLISECONDS } from './config';
import { RootState } from './redux/reducers';
import { useDispatch, useSelector } from 'react-redux';
import { createContractInstance, fetchERC20Allowance, fetchERC20Balance, fetchERC20TokenName, setContractAddress } from './redux/actions/ERC20Transactions';
import * as ERC20Api from './utils/ERC20Api';

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  web3: Web3;
  contract: Contract;
  defaultAccount: string | null | undefined;
};

type LoadERC20TokenProps = {
  web3: Web3;
};

type ApproveAndSendProps = {
  defaultAccount: string;
  contract: any;
  contractERC20: any;
};

// ------------------------------------------
//           LoadERC20Token component
// ------------------------------------------
function LoadERC20Token({
  web3,
}: LoadERC20TokenProps): React.ReactElement<Props> {
  const contractAddress = useSelector((state: RootState): string => state.ERC20Transactions.contractAddress ?? "")
  const dispatch = useDispatch();

  // Fetch ERC20 token contract
  useEffect(() => {
    // create contract instance
    dispatch(createContractInstance(contractAddress, web3))
  }, [web3, contractAddress, dispatch]);

  const setTokenAddress = (address: string): void => {
    dispatch(setContractAddress(address))
  }

  // Render
  return (
    <Box>
      <Typography gutterBottom>
        What&apos;s the ERC20 token&apos;s contract address?
      </Typography>
      <TextField
        InputProps={{
          value: contractAddress,
        }}
        id="erc-input-token-address"
        margin="normal"
        onChange={(e) => setTokenAddress(e.target.value)}
        placeholder="0xbeddb07..."
        style={{ margin: 5 }}
        variant="outlined"
      />
    </Box>
  );
}

// ------------------------------------------
//           ApproveAndSendERC20 component
// ------------------------------------------
function ApproveAndSendERC20({
  contract, // the bridge contract
  contractERC20, // the ERC20 token contract
  defaultAccount, // the users wallet address
}: ApproveAndSendProps): React.ReactElement<Props> {
  const dispatch = useDispatch()
  // Blockchain state from blockchain
  const allowance = useSelector((state: RootState) => state.ERC20Transactions.allowance)
  const balance = useSelector((state: RootState) => state.ERC20Transactions.balance)
  const tokenContractInstance = useSelector((state: RootState) => state.ERC20Transactions.contractInstance)
  const tokenName = useSelector((state: RootState) => state.ERC20Transactions.name)

  // User input state
  const [approvalAmount, setApprovalAmount] = useState(0);
  const [polkadotRecipient, setPolkadotRecipient] = useState(String);
  const [depositAmount, setDepositAmount] = useState(0);

  useEffect(() => {
    const fetchChainData = async () => {
      dispatch(fetchERC20Allowance(contractERC20, defaultAccount, contract._address))
      dispatch(fetchERC20Balance(contractERC20, defaultAccount))
      dispatch(fetchERC20TokenName(contractERC20))
    };

    fetchChainData();
    setInterval(() => {
      fetchChainData();
    }, REFRESH_INTERVAL_MILLISECONDS);
  }, [contract._address, contractERC20, contractERC20.methods,
    defaultAccount, dispatch, tokenContractInstance]);

  // Handlers
  const handleApproveERC20 = async () => {
    await ERC20Api.approveERC20(contractERC20, contract._address,
      defaultAccount, await ERC20Api.addDecimals(contractERC20, approvalAmount))
  };

  const handleSendERC20 = async () => {
    // Send ERC20 token to bank contract
    await ERC20Api.sendERC20(defaultAccount, polkadotRecipient, contractERC20, contract,
      await ERC20Api.addDecimals(contractERC20, depositAmount))
  };

  // Render
  return (
    <Box>
      <Box marginTop={'15px'} />
      <Divider />
      <Box marginTop={'15px'} />
      <Typography gutterBottom variant="h5">
        1. Approve
      </Typography>
      <Typography gutterBottom>
        How many ERC20 tokens would you like to approve to the ERC20 App?
      </Typography>
      <TextField
        InputProps={{
          value: approvalAmount,
        }}
        id="erc-input-approval"
        margin="normal"
        type="number"
        onChange={(e) => setApprovalAmount(Number(e.target.value))}
        placeholder="20"
        style={{ margin: 5 }}
        variant="outlined"
      />
      <Box alignItems="center" display="flex" justifyContent="space-around">
        <Box>
          <Typography>
            Current ERC20 token balance: {Number(balance).toFixed(18)} {tokenName}
          </Typography>
        </Box>
        <Box
          alignItems="center"
          display="flex"
          height="100px"
          paddingBottom={1}
          paddingTop={2}
          width="300px"
        >
          <Button
            color="primary"
            fullWidth={true}
            onClick={() => handleApproveERC20()}
            variant="outlined"
          >
            <Typography variant="button">Approve</Typography>
          </Button>
        </Box>
      </Box>
      <Divider />
      <Box marginTop={'15px'}>
        <Typography gutterBottom variant="h5">
          2. Send
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column">
        <Box padding={1} />
        <Typography gutterBottom>
          What account would you like to fund on Polkadot?
        </Typography>
        <TextField
          InputProps={{
            value: polkadotRecipient,
          }}
          id="erc-input-recipient"
          margin="normal"
          onChange={(e) => setPolkadotRecipient(e.target.value)}
          placeholder={'38j4dG5GzsL1bw...'}
          style={{ margin: 5 }}
          variant="outlined"
        />
        <Box padding={1} />
        <Typography gutterBottom>
          How many ERC20 tokens would you like to deposit
        </Typography>
        <TextField
          InputProps={{
            value: depositAmount,
          }}
          id="erc-input-amount"
          margin="normal"
          type="number"
          onChange={(e) => setDepositAmount(Number(e.target.value))}
          placeholder="20"
          style={{ margin: 5 }}
          variant="outlined"
        />
        <Box alignItems="center" display="flex" justifyContent="space-around">
          <Box>
            <Typography>
              Current ERC20 App allowance: {Number(allowance).toFixed(18)} {tokenName}
            </Typography>
          </Box>
          <Box
            alignItems="center"
            display="flex"
            height="100px"
            paddingBottom={1}
            paddingTop={2}
            width="300px"
          >
            <Button
              color="primary"
              disabled={allowance === 0}
              fullWidth={true}
              onClick={() => handleSendERC20()}
              variant="outlined"
            >
              <Typography variant="button">Send</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ------------------------------------------
//               AppERC20 component
// ------------------------------------------
function AppERC20({
  contract,
  defaultAccount,
  web3,
}: Props): React.ReactElement<Props> {
  // ERC20 token contract instance
  const tokenContract = useSelector((state: RootState) => state.ERC20Transactions.contractInstance)


  if (defaultAccount === null || !defaultAccount) {
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
        <Grid item xs={10}>
          <Typography gutterBottom variant="h5">
            ERC20 App
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <LoadERC20Token
            web3={web3}
          />
          {tokenContract && (
            <ApproveAndSendERC20
              contract={contract}
              contractERC20={tokenContract}
              defaultAccount={defaultAccount}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default styled(AppERC20)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
