import React from 'react';
import {
  Button,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../redux/reducers';
import { burnToken } from '../../redux/actions/transactions';

// ------------------------------------------
//               AppPolkadot component
// ------------------------------------------
function AppPolkadot(): React.ReactElement {
  const { selectedAsset, depositAmount } = useSelector((state: RootState) => state.bridge);
  const dispatch = useDispatch();
  const tokenSymbol = ` Snow${selectedAsset?.token.symbol}`;

  function SendButton() {
    return (
      <Button
        color="primary"
        onClick={() => dispatch(burnToken())}
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
