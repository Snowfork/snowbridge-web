import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BridgeHealthState {
  basicOutboundEthNonce: number,
  basicInboundEthNonce: number,
  incentivizedOutboundEthNonce: number,
  incentivizedInboundEthNonce: number,

  basicOutboundParachainNonce: number,
  basicInboundParachainNonce: number,
  incentivizedOutboundParachainNonce: number,
  incentivizedInboundParachainNonce: number,

  relaychainLatestBlock: number,
  ethLatestBeefyBlock: number,

  parachainLatestEthHeader: number,
  ethLatestBlock: number,
}

const initialState: BridgeHealthState = {
  basicOutboundEthNonce: 0,
  basicInboundEthNonce: 0,
  incentivizedOutboundEthNonce: 0,
  incentivizedInboundEthNonce: 0,

  basicOutboundParachainNonce: 0,
  basicInboundParachainNonce: 0,
  incentivizedOutboundParachainNonce: 0,
  incentivizedInboundParachainNonce: 0,

  relaychainLatestBlock: 0,
  ethLatestBeefyBlock: 0,

  parachainLatestEthHeader: 0,
  ethLatestBlock: 0,
};

export const bridgeHealthSlice = createSlice({
  name: 'bridgeHealth',
  initialState,
  reducers: {
    refresh:
      (_, action: PayloadAction<BridgeHealthState>) => action.payload,
  },
});

export default bridgeHealthSlice.reducer;