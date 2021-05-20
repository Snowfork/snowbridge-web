/* eslint-disable no-param-reassign */
import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssetTransferSdk } from 'asset-transfer-sdk/lib';

export interface NetState {
  metamaskMissing: boolean,
  polkadotJSMissing: boolean,
  metamaskNetwork: string,
  web3?: Web3,
  polkadotApi?: ApiPromise,
  polkadotAddress?: string,
  ethAddress?: string,
  isNetworkConnected: boolean,
  sdk?: AssetTransferSdk
}

const initialState : NetState = {
  metamaskMissing: false,
  polkadotJSMissing: false,
  metamaskNetwork: '',
  web3: undefined,
  polkadotApi: undefined,
  polkadotAddress: undefined,
  ethAddress: undefined,
  isNetworkConnected: false,
  sdk: undefined,
};

export const netSlice = createSlice({
  name: 'net',
  initialState,
  reducers: {
    setMetamaskMissing: (state) => { state.metamaskMissing = true; },
    setPolkadotjsMissing: (state) => { state.metamaskMissing = true; },
    setMetamaskNetwork: (state, action: PayloadAction<string>) => {
      state.metamaskNetwork = action.payload;
    },
    setWeb3: (state, action: PayloadAction<Web3>) => {
      state.web3 = action.payload;
    },
    setEthAddress: (state, action: PayloadAction<string>) => {
      state.ethAddress = action.payload;
    },
    setPolkadotAddress: (state, action: PayloadAction<string>) => {
      state.polkadotAddress = action.payload;
    },
    setPolkadotApi: (state, action: PayloadAction<ApiPromise>) => {
      state.polkadotApi = action.payload;
    },
    setNetworkConnected: (state, action: PayloadAction<boolean>) => {
      state.isNetworkConnected = action.payload;
    },
    setSdk: (state, action : PayloadAction<AssetTransferSdk>) => {
      state.sdk = action.payload;
    },
  },
});

export default netSlice.reducer;
