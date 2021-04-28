import React from 'react';
import {
  Button,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../redux/reducers';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';

// ------------------------------------------
//               AppPolkadot component
// ------------------------------------------
function AppPolkadot(): React.ReactElement {
  const { selectedAsset, depositAmount } = useSelector((state: RootState) => state.bridge);
  const dispatch = useDispatch();

  async function handleDepositClicked() {
    try {
      // TODO:
      console.log('this does nothing');
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
        {selectedAsset?.symbol}
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
