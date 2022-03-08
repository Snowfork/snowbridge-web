import React, { useEffect,useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import {
  setDepositAmount,
  initializeTokens
} from '../../../redux/actions/bridge';

import {
  tokenBalancesByNetwork,
} from '../../../redux/reducers/bridge';

import { decimals } from '../../../types/Asset';
import { useAppSelector } from '../../../utils/hooks';

import ExpandButton from '../../Button/ExpandButton';
import AmountInput from '../../Input/AmountInput';

const INSUFFICIENT_BALANCE_ERROR = 'Insufficient funds';
const AMOUNT_NOT_SET_ERROR = 'Set transfer amount';

type Props = {
  className?: string;
  openAssetSelector: () => void,
  setError: (error: string) => void,
}

const SelectedFungibleToken = ({ className, openAssetSelector, setError }: Props) => {
  // state
  const tokenBalances = useAppSelector(tokenBalancesByNetwork);

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const dispatch = useDispatch();
  const decimalMap = decimals(selectedAsset, swapDirection);

  const handleAssetSelector = () => {
    openAssetSelector();
    dispatch(initializeTokens());
  }

  useEffect(() => {
  }, [dispatch]);
  const setStableError = useCallback(setError,[]);
  useEffect(() => {
    const checkDepositAmount = (amount: string) => {
      const amountParsed = amount
        && decimalMap.from
        && new BigNumber(
          // make sure we are comparing the same units
          utils.parseUnits(
            amount || '0', decimalMap.from,
          ).toString(),
        );
      const amountTooHigh = amountParsed && amountParsed.isGreaterThan(
        new BigNumber(tokenBalances.sourceNetwork),
      );
      const amountTooLow = amountParsed && amountParsed.isEqualTo(0);
      if (amountTooHigh) {
        setStableError(INSUFFICIENT_BALANCE_ERROR);
      } else if (amountTooLow) {
        setStableError(AMOUNT_NOT_SET_ERROR);
      }
      else {
        setStableError('');
      }
    }
    checkDepositAmount(depositAmount);
  }, [setStableError,depositAmount, tokenBalances, decimalMap.from]);

  const handleMaxClicked = () => {
    const amount = tokenBalances.sourceNetwork;
    const depositAmountFormatted = utils.formatUnits(amount, decimalMap.from);
    dispatch(setDepositAmount(depositAmountFormatted));
  };

  const handleDepositAmountChanged = (e: any) => {
    if (e.target.value) {
      dispatch(setDepositAmount(e.target.value));
    } else {
      dispatch(setDepositAmount(''));
    }
  };

  return (
    <div className={className}>
      <div>
        <div className={'sft-amount-section'}>
          <AmountInput
            placeholder="0"
            value={depositAmount}
            onChange={handleDepositAmountChanged}
            type="number"
            onPillClick={handleMaxClicked}
          />
          <ExpandButton onClick={handleAssetSelector}>
            {selectedAsset?.symbol}
          </ExpandButton>
        </div>
      </div>
    </div>
  );
};

export default styled(SelectedFungibleToken)`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .sft-amount-section {
    display: flex;
    flex-direction: row;
    gap: 5px;
  }
`;
