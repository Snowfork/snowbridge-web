import React from 'react';
import {
  Button,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { utils } from 'ethers';
import { RootState } from '../../redux/reducers';
import { burnPolkadotAsset, lockPolkadotAsset } from '../../redux/actions/transactions';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import { SNOW_DOT_ADDRESS } from '../../config';

// ------------------------------------------
//               AppPolkadot component
// ------------------------------------------
function AppPolkadot(): React.ReactElement {
  const { selectedAsset, depositAmount } = useSelector((state: RootState) => state.bridge);
  const dispatch = useDispatch();
  const tokenSymbol = ` Snow${selectedAsset?.token.symbol}`;

  async function handleDepositClicked() {
    try {
      if (selectedAsset?.token.address === SNOW_DOT_ADDRESS) {
      // format deposit amount into unit value
        const unitValue = utils.parseUnits(depositAmount, selectedAsset?.token.decimals).toString();
        dispatch(lockPolkadotAsset(unitValue));
        return;
      }

      dispatch(burnPolkadotAsset());
    } catch (e) {
      console.log('failed burning token', e);
    } finally {
      dispatch(setShowConfirmTransactionModal(false));
    }
  }

  function SendButton() {
    return (
      <Button
        color="primary"
        onClick={handleDepositClicked}
        variant="contained"
        disabled={Number(depositAmount) <= 0}
      >
        Send
        {tokenSymbol}
      </Button>
    );
  }

  // Render
  return (
    <SendButton />
  );
}

export default React.memo(styled(AppPolkadot)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
