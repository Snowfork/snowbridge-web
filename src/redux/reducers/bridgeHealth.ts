import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BlockInfo {
  latency: number,
  lastUpdated: Date | null,
  lastUpdatedBestGuess: boolean,
}

export interface MessageInfo {
  unconfirmed: number,
  lastUpdated: Date | null,
  lastUpdatedBestGuess: boolean,
}

export interface BridgeInfo {
  messagesRelativeTime: boolean,
  blocks: BlockInfo,
  messages: MessageInfo,
}

export interface BridgeHealthState {
  lastUpdated: Date,
  hasError: boolean,
  errorMessage: string,
  isLoading: boolean,
  polkadotToEthereum: BridgeInfo,
  ethereumToPolkadot: BridgeInfo,
}

const initialState: BridgeHealthState = {
  lastUpdated: new Date(0),
  hasError: false,
  errorMessage: "",
  isLoading: true,
  polkadotToEthereum: {
    messagesRelativeTime: true,
    blocks: {
      latency: 0,
      lastUpdated: new Date(Date.now()),
      lastUpdatedBestGuess: false,
    },
    messages: {
      unconfirmed: 0,
      lastUpdated: new Date(Date.now()),
      lastUpdatedBestGuess: false,
    }
  },
  ethereumToPolkadot: {
    messagesRelativeTime: true,
    blocks: {
      latency: 0,
      lastUpdated: new Date(Date.now()),
      lastUpdatedBestGuess: false,
    },
    messages: {
      unconfirmed: 0,
      lastUpdated: new Date(Date.now()),
      lastUpdatedBestGuess: false,
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
        state.isLoading = false;
        state.hasError = true;
        state.errorMessage = action.payload;
        return state;
      },
    setLoading:
      (state, action: PayloadAction<boolean>) => {
        if (action.payload) {
          state.isLoading = true;
        } else {
          state.isLoading = false;
        }
        state.hasError = false;
        state.errorMessage = "";
        return state;
      },
  },
});

export default bridgeHealthSlice.reducer;