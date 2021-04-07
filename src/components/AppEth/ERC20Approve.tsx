// General
import React, { useState } from 'react';
import styled from 'styled-components';

// External
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from '@material-ui/core';

// Local
import { useSelector } from 'react-redux';
import * as ERC20Api from '../../utils/ERC20Api';
import { Token } from '../../types';
import { RootState } from '../../redux/reducers';
import LoadingSpinner from '../LoadingSpinner';

// ------------------------------------------
//                  Props
// ------------------------------------------
type ERC20ApproveProps = {
  selectedEthAccount: string;
  erc20TokenContract: any;
  selectedToken: Token;
  currentTokenBalance: number;
};

// ------------------------------------------
//           ERC20Approve component
// ------------------------------------------
function ERC20Approve({
  erc20TokenContract,
  selectedEthAccount,
  selectedToken,
  currentTokenBalance,
}: ERC20ApproveProps): React.ReactElement {
  // User input state
  const [approvalAmount, setApprovalAmount] = useState<number | string>('');
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  // global state
  const bridgeERC20AppContract = useSelector((state: RootState) => state.net.erc20Contract);

  // Handlers
  const handleApproveERC20 = async () => {
    try {
      setIsApprovalLoading(true);
      await ERC20Api.approveERC20(erc20TokenContract, bridgeERC20AppContract!.options.address,
        selectedEthAccount, await ERC20Api.addDecimals(selectedToken, `${approvalAmount}`));
    } catch (e) {
      console.log('error approving erc20!', e);
    } finally {
      setIsApprovalLoading(false);
    }
  };

  // Render
  return (
    <>
      {isApprovalLoading
        ? (
          <Box width="60%" alignItems="center" justifyContent="space-between" display="flex">
            <Typography gutterBottom>
              Approving
              {' '}
              {selectedToken.symbol}
            </Typography>
            <LoadingSpinner spinnerHeight="40px" spinnerWidth="40px" />
          </Box>
        )
        : (
          <Box>
            <Box>
              <Box marginTop="15px" />
              <Divider />
              <Box marginTop="15px" />
              <Typography gutterBottom variant="h5">
                1. Approve
              </Typography>
              <Typography gutterBottom>
                How many
                {' '}
                {selectedToken.symbol}
                {' '}
                tokens would you like to approve to the ERC20 bridge?
              </Typography>
              <TextField
                InputProps={{
                  value: approvalAmount,
                }}
                id="erc-input-approval"
                margin="normal"
                type="number"
                onChange={(e) => setApprovalAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder={`0.00 ${selectedToken.symbol}`}
                style={{ margin: 5 }}
                variant="outlined"
              />
              <Box alignItems="center" display="flex" justifyContent="space-around">

                <Box>
                  <Typography>
                    Current
                    {' '}
                    {selectedToken.symbol}
                    {' '}
                    token balance:
                    {' '}
                    {Number(currentTokenBalance).toFixed(selectedToken.decimals)}
                    {' '}
                    {selectedToken.symbol}
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
                    fullWidth
                    onClick={() => handleApproveERC20()}
                    variant="outlined"
                  >
                    <Typography variant="button">Approve</Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
            <Divider />
            <Box marginTop="15px">
              <Typography gutterBottom variant="h5">
                2. Send
              </Typography>
            </Box>
          </Box>
        )}
    </>
  );
}

export default styled(ERC20Approve)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
