import {
  SET_NET,
  SET_METAMASK_FOUND,
  SET_METAMASK_CONNECTED,
  SET_POLKADOTJS_FOUND,
  SET_POLKADOTJS_CONNECTED,
  SET_METAMASK_MISSING,
  SET_POLKADOTJS_MISSING,
  SET_METAMASK_NETWORK,
  SET_ETH_CONTRACT,
  SET_WEB3,
  SET_ERC20_CONTRACT,
  SET_INCENTIVIZED_CHANNEL_CONTRACT
} from '../actionsTypes';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';

export const setNet = (net: any) => {
  return {
    type: SET_NET,
    payload: net,
  };
};

export const setMetamaskFound = () => {
  return {
    type: SET_METAMASK_FOUND,
  };
};

export const setMetamaskConnected = () => {
  return {
    type: SET_METAMASK_CONNECTED,
  };
};

export const setMetamaskMissing = () => {
  return {
    type: SET_METAMASK_MISSING,
  };
};

export const setMetamaskNetwork = (network: string) => {
  return {
    type: SET_METAMASK_NETWORK,
    metamaskNetwork: network,
  };
};

export const setPolkadotJSFound = () => {
  return {
    type: SET_POLKADOTJS_FOUND,
  };
};

export const setPolkadotJSConnected = () => {
  return {
    type: SET_POLKADOTJS_CONNECTED,
  };
};

export const setPolkadotJSMissing = () => {
  return {
    type: SET_POLKADOTJS_MISSING,
  };
};

export interface SetWeb3Payload { type: string, web3: Web3 };
export const setWeb3 = (web3: Web3) => ({
  type: SET_WEB3,
  web3
})

export interface SetEthContractPayload { type: string, contract: Contract };
export const setEthContract = (contract: Contract) : SetEthContractPayload => ({
  type: SET_ETH_CONTRACT,
  contract
})

export interface SetERC20ContractPayload { type: string, contract: Contract };
export const setERC20Contract = (contract: Contract): SetEthContractPayload => ({
  type: SET_ERC20_CONTRACT,
  contract
})

export interface SetIncentivizedChannelContractPayload { type: string, contract: Contract };
export const setIncentivizedChannelContract = (contract: Contract): SetIncentivizedChannelContractPayload => ({
  type: SET_INCENTIVIZED_CHANNEL_CONTRACT,
  contract
})
