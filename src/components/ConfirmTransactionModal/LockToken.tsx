// General
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Local
import { useDispatch } from 'react-redux';
import { utils } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { approveERC20, fetchERC20Allowance } from '../../redux/actions/ERC20Transactions';
import LoadingSpinner from '../LoadingSpinner';
import { APP_ERC721_CONTRACT_ADDRESS, REFRESH_INTERVAL_MILLISECONDS } from '../../config';
import {
  decimals, isErc20, isNonFungible, NonFungibleToken,
} from '../../types/Asset';
import { doTransfer } from '../../redux/actions/transactions';
import { SwapDirection } from '../../types/types';
import { useAppSelector } from '../../utils/hooks';
import { approveERC721 } from '../../redux/actions/ERC721Transacitons';
import * as ERC721Api from '../../net/ERC721';

import DOSButton from '../Button/DOSButton';

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

  const [isApproved, setIsApproved] = useState(false);
  const [isApprovalPending, setIsApprovalPending] = useState(false);

  const dispatch = useDispatch();
  const currentTokenAllowance = allowance;

  // update allowances to prevent failed transactions
  // e.g the user might spend entire allowance on 1st transaction
  // so we need to update the allowance before sending the 2nd transaction
  useEffect(() => {
    function fungiblePoll() {
      return setInterval(() => {
        dispatch(fetchERC20Allowance());
      }, REFRESH_INTERVAL_MILLISECONDS);
    }

    function nonFungiblePoll() {
      return setInterval(async () => {
        const res = await ERC721Api.getApproved(
          selectedAsset!.contract!,
          (selectedAsset?.token as NonFungibleToken).ethId,
        );
        setIsApproved(res === APP_ERC721_CONTRACT_ADDRESS);
      }, REFRESH_INTERVAL_MILLISECONDS);
    }

    let interval: NodeJS.Timeout;

    if (!isNonFungible(selectedAsset!)) {
      interval = fungiblePoll();
    } else {
      interval = nonFungiblePoll();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch, selectedAsset]);

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
      if (isNonFungible(selectedAsset!)) {
        await dispatch(approveERC721());
      } else {
        await dispatch(approveERC20());
      }
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
  // we only need approval for erc20, erc721 transfers in eth -> polkadot direction
  const requiresApproval = swapDirection === SwapDirection.EthereumToPolkadot
    && selectedAsset
    && (isErc20(selectedAsset) || isNonFungible(selectedAsset))
    && (
      (isErc20(selectedAsset) && depositAmountFormatted.isGreaterThan(currentAllowanceFormatted))
      || (isNonFungible(selectedAsset) && !isApproved)
    );

  const DepositButton = () => {
    if (requiresApproval) {
      return (
        <DOSButton
          onClick={handleTokenUnlock}
          disabled={isApprovalPending}
        >
          Unlock Token
          {
            isApprovalPending && <LoadingSpinner spinnerWidth="40px" spinnerHeight="40px" />
          }
        </DOSButton>
      );
    }

    return (
      <DOSButton
        onClick={handleDepositToken}
      >
        Deposit
        {' '}
        {selectedAsset?.symbol}
      </DOSButton>
    );
  };

  // Render
  return (
    <DepositButton />
  );
}

export default styled(LockToken)`
`;
