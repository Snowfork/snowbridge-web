/* eslint-disable no-param-reassign */
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NetState {
  metamaskMissing: boolean,
  polkadotJSMissing: boolean,
  metamaskNetwork: string,
  web3?: Web3,
  ethContract?: Contract,
  erc20Contract?: Contract,
  incentivizedChannelContract?: Contract,
  basicChannelContract?: Contract,
  appDotContract?: Contract,
  polkadotApi?: ApiPromise,
  polkadotAddress?: string,
  ethAddress?: string,
  isNetworkConnected: boolean,
}

const initialState : NetState = {
  metamaskMissing: false,
  polkadotJSMissing: false,
  metamaskNetwork: '',
  web3: undefined,
  ethContract: undefined,
  erc20Contract: undefined,
  incentivizedChannelContract: undefined,
  appDotContract: undefined,
  polkadotApi: undefined,
  polkadotAddress: undefined,
  ethAddress: undefined,
  isNetworkConnected: false,
  basicChannelContract: undefined,
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
    setEthContract: (state, action: PayloadAction<Contract>) => {
      state.ethContract = action.payload;
    },
    setERC20Contract: (state, action: PayloadAction<Contract>) => {
      state.erc20Contract = action.payload;
    },
    setIncentivizedChannelContract: (state, action: PayloadAction<Contract>) => {
      state.incentivizedChannelContract = action.payload;
    },
    setBasicChannelContract: (state, action: PayloadAction<Contract>) => {
      state.basicChannelContract = action.payload;
    },
    setAppDotContract: (state, action: PayloadAction<Contract>) => {
      state.appDotContract = action.payload;
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
  },
});

export default netSlice.reducer;
