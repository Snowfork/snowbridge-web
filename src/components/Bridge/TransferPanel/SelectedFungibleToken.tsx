import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import {
  setDepositAmount
} from '../../../redux/actions/bridge';

import {
  tokenBalancesByNetwork,
} from '../../../redux/reducers/bridge';

import { decimals } from '../../../types/Asset';
import { useAppSelector } from '../../../utils/hooks';

import SelectAssetButton from '../../Button/SelectAssetButton';
import AmountInput from '../../Input/AmountInput';
import FungibleTokenBalance from './FungibleTokenBalance';

const INSUFFICIENT_BALANCE_ERROR = 'Insufficient funds';

type Props = {
  className?: string;
  setShowAssetSelector: (show: boolean) => void,
  setError: (error: string) => void,
}

const SelectedFungibleToken = ({ className, setShowAssetSelector, setError }: Props) => {
  // state
  const tokenBalances = useAppSelector(tokenBalancesByNetwork);

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const dispatch = useDispatch();
  const decimalMap = decimals(selectedAsset, swapDirection);

  useEffect(() => {
  }, [dispatch]);

  useEffect(() => {
    const checkDepositAmount = (amount: string) => {
      if (amount
        && decimalMap.from
        && new BigNumber(
          // make sure we are comparing the same units
          utils.parseUnits(
            amount || '0', decimalMap.from,
          ).toString(),
        )
          .isGreaterThan(
            new BigNumber(tokenBalances.sourceNetwork),
          )
      ) {
        setError(INSUFFICIENT_BALANCE_ERROR);
      } else {
        setError('');
      }
    }
    checkDepositAmount(depositAmount);
  }, [depositAmount, tokenBalances, decimalMap.from]);

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
            placeholder="0.0"
            value={depositAmount}
            onChange={handleDepositAmountChanged}
            type="number"
            onPillClick={handleMaxClicked}
          />
          <SelectAssetButton onClick={() => setShowAssetSelector(true)}>
            {selectedAsset?.symbol}
          </SelectAssetButton>
        </div>
      </div>
      {selectedAsset && <FungibleTokenBalance amount={tokenBalances.sourceNetwork}
        decimals={decimalMap.from} />}
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
