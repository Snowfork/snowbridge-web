import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BlockInfo {
  latency: number,
  lastUpdated: Date,
}

export interface MessageInfo {
  unconfirmed: number,
  lastUpdated: Date,
}

export interface BridgeInfo {
  blocks: BlockInfo,
  messages: MessageInfo,
}

export interface BridgeHealthState {
  lastUpdated: Date,
  error: boolean,
  errorMessage: string,
  loading: boolean,
  polkadotToEthereum: BridgeInfo,
  ethereumToPolkadot: BridgeInfo,
}

const initialState: BridgeHealthState = {
  lastUpdated: new Date(0),
  error: false,
  errorMessage: "",
  loading: true,
  polkadotToEthereum: {
      blocks: {
        latency: 0,
        lastUpdated: new Date(Date.now()),
      },
      messages: {
        unconfirmed: 0,
        lastUpdated: new Date(Date.now()),
      }
    },
    ethereumToPolkadot: {
      blocks: {
        latency: 0,
        lastUpdated: new Date(Date.now()),
      },
      messages: {
        unconfirmed: 0,
        lastUpdated: new Date(Date.now()),
      }
    }
  };

export const bridgeHealthSlice = createSlice({
  name: 'bridgeHealth',
  initialState,
  reducers: {
    setPolkadotBlockHealth:
      (state, action: PayloadAction<BlockInfo>) => {
        state.polkadotToEthereum.blocks = action.payload;
        return state;
      },
    setPolkadotMessageHealth:
      (state, action: PayloadAction<MessageInfo>) => {
        state.polkadotToEthereum.messages = action.payload;
        return state;
      },
    setEthereumBlockHealth:
      (state, action: PayloadAction<BlockInfo>) => {
        state.ethereumToPolkadot.blocks = action.payload;
        return state;
      },
    setEthereumMessageHealth:
      (state, action: PayloadAction<MessageInfo>) => {
        state.ethereumToPolkadot.messages = action.payload;
        return state;
      },
    setLastUpdated:
      (state, action: PayloadAction<Date>) => {
        state.lastUpdated = action.payload;
        return state;
      },
    setError: 
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = true;
        state.errorMessage = action.payload;
        return state;
      },
    setLoading:
      (state, action: PayloadAction<boolean>) => {
        if(action.payload) {
          state.loading = true;
        } else {
          state.loading = false;
        }
        state.error = false;
        state.errorMessage = "";
        return state;
      },
  },
});

export default bridgeHealthSlice.reducer;