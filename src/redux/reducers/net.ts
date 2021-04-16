import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import {
  SetBasicChannelContractPayload,
  SetERC20ContractPayload,
  SetEthAddressPayload,
  SetEthContractPayload,
  SetIncentivizedChannelContractPayload,
  SetIsNetworkConnectedPayload,
  SetPolkadotAddressPayload,
  SetPolkadotApiPayload,
  SetWeb3Payload,
} from '../actions/net';
import {
  SET_NETWORK_CONNECTED,
  SET_METAMASK_MISSING,
  SET_POLKADOTJS_MISSING,
  SET_METAMASK_NETWORK,
  SET_ETH_CONTRACT,
  SET_WEB3,
  SET_ERC20_CONTRACT,
  SET_INCENTIVIZED_CHANNEL_CONTRACT,
  SET_POLKADOT_ADDRESS,
  SET_ETH_ADDRESS,
  SET_POLKADOT_API,
  SET_BASIC_CHANNEL_CONTRACT,
} from '../actionsTypes/net';

export interface NetState {
  metamaskConnected: boolean,
  polkadotJSConnected: boolean,
  metamaskMissing: boolean,
  polkadotJSMissing: boolean,

  metamaskNetwork: string,
  web3?: Web3,
  ethContract?: Contract,
  erc20Contract?: Contract,
  incentivizedChannelContract?: Contract,
  basicChannelContract?: Contract,
  polkadotApi?: ApiPromise,
  polkadotAddress?: string,
  ethAddress?: string,
  // polkadot AssetId for the eth asset
  isNetworkConnected: boolean,
}

const initialState : NetState = {
  metamaskConnected: false,
  polkadotJSConnected: false,
  metamaskMissing: false,
  polkadotJSMissing: false,

  metamaskNetwork: '',
  web3: undefined,
  ethContract: undefined,
  erc20Contract: undefined,
  incentivizedChannelContract: undefined,
  polkadotApi: undefined,
  polkadotAddress: undefined,
  ethAddress: undefined,
  isNetworkConnected: false,
  basicChannelContract: undefined,
};

function netReducer(state = initialState, action: any): NetState {
  switch (action.type) {
    case SET_METAMASK_MISSING: {
      return { ...state, metamaskMissing: true };
    }
    case SET_POLKADOTJS_MISSING: {
      return { ...state, polkadotJSMissing: true };
    }
    case SET_METAMASK_NETWORK: {
      return { ...state, metamaskNetwork: action.metamaskNetwork };
    }
    case SET_WEB3: {
      return ((action: SetWeb3Payload) => ({ ...state, web3: action.web3 }))(action);
    }
    case SET_ETH_CONTRACT: {
      return ((action: SetEthContractPayload) => (
        {
          ...state,
          ethContract: action.contract,
        }))(action);
    }
    case SET_ERC20_CONTRACT: {
      return ((action: SetERC20ContractPayload) => (
        {
          ...state,
          erc20Contract: action.contract,
        }))(action);
    }
    case SET_INCENTIVIZED_CHANNEL_CONTRACT: {
      return ((action: SetIncentivizedChannelContractPayload): NetState => (
        {
          ...state,
          incentivizedChannelContract: action.contract,
        }))(action);
    }
    case SET_BASIC_CHANNEL_CONTRACT: {
      return ((action: SetBasicChannelContractPayload): NetState => (
        {
          ...state,
          basicChannelContract: action.contract,
        }))(action);
    }
    case SET_ETH_ADDRESS: {
      return ((action: SetEthAddressPayload) => ({ ...state, ethAddress: action.address }))(action);
    }
    case SET_POLKADOT_ADDRESS: {
      return ((action: SetPolkadotAddressPayload): NetState => (
        {
          ...state,
          polkadotAddress: action.address,
        }))(action);
    }
    case SET_POLKADOT_API: {
      return ((action: SetPolkadotApiPayload): NetState => (
        {
          ...state,
          polkadotApi: action.polkadotApi,
        }))(action);
    }
    case SET_NETWORK_CONNECTED: {
      return ((action: SetIsNetworkConnectedPayload): NetState => (
        {
          ...state,
          isNetworkConnected: action.isConnected,
        }))(action);
    }
    default:
      return state;
  }
}

export default netReducer;
