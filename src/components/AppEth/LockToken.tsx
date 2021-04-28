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
import { useDispatch, useSelector } from 'react-redux';
import { utils } from 'ethers';
import { RootState } from '../../redux/reducers';
import { approveERC20, fetchERC20Allowance } from '../../redux/actions/ERC20Transactions';
import LoadingSpinner from '../LoadingSpinner';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import { REFRESH_INTERVAL_MILLISECONDS } from '../../config';
import { isErc20 } from '../../types/Asset';
// ------------------------------------------
//           LockToken component
// ------------------------------------------
function LockToken(): React.ReactElement {
  const { allowance } = useSelector((state: RootState) => state.ERC20Transactions);
  const { selectedAsset, depositAmount } = useSelector((state: RootState) => state.bridge);
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
  }, []);

  // lock assets
  const handleDepositToken = async () => {
    try {
      // TODO:
      console.log('this does nothing...');
    } catch (e) {
      console.log('Failed to lock eth asset', e);
    } finally {
      dispatch(setShowConfirmTransactionModal(false));
    }
  };

  // approve spending of token
  const handleTokenUnlock = async () => {
    try {
      setIsApprovalPending(true);
      // format deposit amount into unit value
      const decimals = selectedAsset?.decimals;
      const unitValue = utils.parseUnits(depositAmount, decimals).toString();
      await dispatch(approveERC20(unitValue));
    } catch (e) {
      console.log('error approving!');
    } finally {
      setIsApprovalPending(false);
    }
  };

  const DepositButton = () => {
    // we don't need approval to burn snowDot
    // if (selectedAsset?.isErc20 && !selectedAsset?.isDot) {
    // TODO: test - this should work because isErc20 checks the chain... so DOT would be false
    if (isErc20(selectedAsset!)) {
      if (
        Number.parseFloat(currentTokenAllowance.toString())
        < Number.parseFloat(depositAmount.toString())
      ) {
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
        {selectedAsset?.symbol }
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
