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

  relayChainLatestBlock: number,
  ethBeefyLatestBlock: number,

  relayChainLatestEthHeader: number,
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

  relayChainLatestBlock: 0,
  ethBeefyLatestBlock: 0,

  relayChainLatestEthHeader: 0,
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