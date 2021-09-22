// General
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Local
import { useDispatch } from 'react-redux';
import { utils } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { approveERC20, fetchERC20Allowance } from '../../redux/actions/ERC20Transactions';
import { approveERC721, fetchERC721Approved } from '../../redux/actions/ERC721Transactions';

import { REFRESH_INTERVAL_MILLISECONDS } from '../../config';
import {
  decimals, isErc20, isNonFungible,
} from '../../types/Asset';
import { doTransfer } from '../../redux/actions/transactions';
import { SwapDirection } from '../../types/types';
import { useAppSelector } from '../../utils/hooks';

import DOSButton from '../Button/DOSButton';

// ------------------------------------------
//           LockToken component
// ------------------------------------------
type Props = {
  onTokenLocked: () => void;
  transactionPending?: boolean;
}
function LockToken({ onTokenLocked, transactionPending }: Props): React.ReactElement {
  const { allowance } = useAppSelector((state) => state.ERC20Transactions);
  const { approved } = useAppSelector((state) => state.ERC721Transactions);
  const { selectedAsset, depositAmount, swapDirection } = useAppSelector(
    (state) => state.bridge,
  );

  const [isApprovalPending, setIsApprovalPending] = useState(false);

  const dispatch = useDispatch();
  const currentERC20TokenAllowance = allowance;

  // update allowances to prevent failed transactions
  // e.g the user might spend entire allowance on 1st transaction
  // so we need to update the allowance before sending the 2nd transaction
  useEffect(() => {
    function fungiblePoll() {
      dispatch(fetchERC20Allowance());
      return setInterval(() => {
        dispatch(fetchERC20Allowance());
      }, REFRESH_INTERVAL_MILLISECONDS);
    }

    function nonFungiblePoll() {
      dispatch(fetchERC721Approved());
      return setInterval(async () => {
        dispatch(fetchERC721Approved());
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

  const handleTransferToken = async () => {
    try {
      dispatch(doTransfer());
      onTokenLocked();
    } catch (e) {
      console.log('Failed to transfer asset', e);
    }
  };

  const handleApproveToken = async () => {
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

  const currentERC20AllowanceFormatted = new BigNumber(currentERC20TokenAllowance.toString());
  const transferAmountFormatted = new BigNumber(selectedAsset
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
      (isErc20(selectedAsset) && transferAmountFormatted.isGreaterThan(currentERC20AllowanceFormatted))
      || (isNonFungible(selectedAsset) && !approved)
    );

  const TransferButton = () => {
    if (requiresApproval) {
      return (
        <DOSButton
          onClick={handleApproveToken}
          disabled={isApprovalPending}
          loading={isApprovalPending}
          loadingMessage={'Confirm this transaction in your wallet'}
        >
          Approve Token
        </DOSButton>
      );
    }

    return (
      <DOSButton
        onClick={handleTransferToken}
        loading={transactionPending}
        loadingMessage={'Confirm this transaction in your wallet'}
      >
        Transfer
        {' '}
        {selectedAsset?.symbol}
      </DOSButton>
    );
  };

  // Render
  return (
    <TransferButton />
  );
}

export default styled(LockToken)`
`;
