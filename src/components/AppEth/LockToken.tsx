// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// General
import React, { useState } from 'react';
import styled from 'styled-components';

// External
import {
  Button,
} from '@material-ui/core';

// Local
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers';
import { lockToken } from '../../redux/actions/transactions';
import { approveERC20 } from '../../redux/actions/ERC20Transactions';
import LoadingSpinner from '../LoadingSpinner';

// ------------------------------------------
//           LockToken component
// ------------------------------------------
function LockToken(): React.ReactElement {
  const { allowance } = useSelector((state: RootState) => state.ERC20Transactions);
  const { polkadotAddress } = useSelector((state: RootState) => state.net);
  const { selectedAsset, depositAmount } = useSelector((state: RootState) => state.bridge);
  const [isApprovalPending, setIsApprovalPending] = useState(false);

  const dispatch = useDispatch();

  const isERC20 = selectedAsset?.token?.address !== '0x0';
  const currentTokenAllowance = allowance;

  // lock assets
  const handleDepositToken = async () => {
    dispatch(lockToken(
      depositAmount.toString(),
        selectedAsset!.token,
        polkadotAddress!,
    ));
  };

  // approve spending of token
  const handleTokenUnlock = async () => {
    try {
      setIsApprovalPending(true);
      await dispatch(approveERC20(`${depositAmount}`));
    } catch (e) {
      console.log('error approving!');
    } finally {
      setIsApprovalPending(false);
    }
  };

  const DepositButton = () => {
    if (isERC20) {
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
        {selectedAsset?.token.symbol }
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
