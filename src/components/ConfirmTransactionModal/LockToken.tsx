// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// General
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// External
import {
  Button,
} from '@material-ui/core';

// Local
import { useDispatch } from 'react-redux';
import { utils } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { SwapDirection } from 'asset-transfer-sdk/lib/types';
import { decimals, isErc20 } from 'asset-transfer-sdk/lib/utils';
import { approveERC20, fetchERC20Allowance } from '../../redux/actions/ERC20Transactions';
import LoadingSpinner from '../LoadingSpinner';
import { REFRESH_INTERVAL_MILLISECONDS } from '../../config';
import { doTransfer } from '../../redux/actions/transactions';
import { useAppSelector } from '../../utils/hooks';
// ------------------------------------------
//           LockToken component
// ------------------------------------------
type Props = {
  onTokenLocked: () => void
}
function LockToken({ onTokenLocked }: Props): React.ReactElement {
  const { allowance } = useAppSelector((state) => state.ERC20Transactions);
  const { selectedAsset, depositAmount, swapDirection } = useAppSelector(
    (state) => state.bridge,
  );
  const [isApprovalPending, setIsApprovalPending] = useState(false);

  const dispatch = useDispatch();
  const currentTokenAllowance = allowance;

  // update allowances to prevent failed transactions
  // e.g the user might spend entire allowance on 1st transaction
  // so we need to update the allowance before sending the 2nd transaction
  useEffect(() => {
    function poll() {
      return setInterval(() => {
        dispatch(fetchERC20Allowance());
      }, REFRESH_INTERVAL_MILLISECONDS);
    }

    const interval = poll();

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

  // lock assets
  const handleDepositToken = async () => {
    try {
      dispatch(doTransfer());
      onTokenLocked();
    } catch (e) {
      console.log('Failed to transfer asset', e);
    }
  };

  // approve spending of token
  const handleTokenUnlock = async () => {
    try {
      setIsApprovalPending(true);
      await dispatch(approveERC20());
    } catch (e) {
      console.log('error approving!');
    } finally {
      setIsApprovalPending(false);
    }
  };

  const currentAllowanceFormatted = new BigNumber(currentTokenAllowance.toString());
  const depositAmountFormatted = new BigNumber(selectedAsset
    ? utils.parseUnits(
      depositAmount.toString(),
      decimals(selectedAsset, swapDirection).from,
    ).toString()
    : '0');

  // we don't need approval to burn snowDot
  // we only need approval for erc20 transfers in eth -> polkadot direction
  const requiresApproval = swapDirection === SwapDirection.EthereumToPolkadot
    && selectedAsset
    && isErc20(selectedAsset)
    && depositAmountFormatted.isGreaterThan(currentAllowanceFormatted);

  const DepositButton = () => {
    if (requiresApproval) {
      return (
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleTokenUnlock}
          disabled={isApprovalPending}
        >
          Unlock Token
          {
            isApprovalPending && <LoadingSpinner spinnerWidth="40px" spinnerHeight="40px" />
          }
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        size="large"
        color="primary"
        onClick={handleDepositToken}
      >
        Deposit
        {' '}
        {selectedAsset?.symbol}
      </Button>
    );
  };

  // Render
  return (
    <DepositButton />
  );
}

export default styled(LockToken)`
`;
