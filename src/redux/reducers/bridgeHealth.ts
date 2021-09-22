import { AnyAction, createSlice } from "@reduxjs/toolkit";

export interface BridgeHealthState {
  basicOutboundParachainNonce: number,
  basicOutboundEthNonce: number,
  basicInboundParachainNonce: number,
  basicInboundEthNonce: number,
  incentivizedOutboundParachainNonce: number,
  incentivizedOutboundEthNonce: number,
  incentivizedInboundParachainNonce: number,
  incentivizedInboundEthNonce: number,
  relayChainLatestBlock: number,
  ethBeefyLatestBlock: number,
  relayChainLatestEthHeader: number,
  ethLatestBlock: number,
}

const initialState: BridgeHealthState = {
  basicOutboundParachainNonce: 0,
  basicOutboundEthNonce: 0,
  basicInboundParachainNonce: 0,
  basicInboundEthNonce: 0,
  incentivizedOutboundParachainNonce: 0,
  incentivizedOutboundEthNonce: 0,
  incentivizedInboundParachainNonce: 0,
  incentivizedInboundEthNonce: 0,
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
      (state, _:AnyAction) => {  
        state.basicOutboundParachainNonce++;
        state.basicOutboundEthNonce++;
        state.basicInboundParachainNonce++;
        state.basicInboundEthNonce++;
        state.incentivizedOutboundParachainNonce++;
        state.incentivizedOutboundEthNonce++;
        state.incentivizedInboundParachainNonce++;
        state.incentivizedInboundEthNonce++;
        state.relayChainLatestBlock++;
        state.ethBeefyLatestBlock++;
        state.relayChainLatestEthHeader++;
        state.ethLatestBlock++;
      },
  },
});

export default bridgeHealthSlice.reducer;