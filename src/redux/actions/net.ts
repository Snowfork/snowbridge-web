/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-types */
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import _ from 'lodash';
import { RootState } from '../reducers';
import { parachainMessageDispatched } from './transactions';
import {
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
  SET_INCENTIVIZED_CHANNEL_CONTRACT,
  SET_POLKADOT_ADDRESS,
  SET_ETH_ADDRESS,
  SET_ETH_ASSET_ID,
  SET_POLKADOT_API,
  SET_NETWORK_CONNECTED,
} from '../actionsTypes/net';

export const setMetamaskFound = (): {type: string} => ({
  type: SET_METAMASK_FOUND,
});

export const setMetamaskConnected = (): {type: string} => ({
  type: SET_METAMASK_CONNECTED,
});

export const setMetamaskMissing = (): {type: string} => ({
  type: SET_METAMASK_MISSING,
});

export const setMetamaskNetwork = (network: string): {type: string, metamaskNetwork: string} => ({
  type: SET_METAMASK_NETWORK,
  metamaskNetwork: network,
});

export const setPolkadotJSFound = (): {type: string} => ({
  type: SET_POLKADOTJS_FOUND,
});

export const setPolkadotJSConnected = (): {type: string} => ({
  type: SET_POLKADOTJS_CONNECTED,
});

export const setPolkadotJSMissing = (): {type: string} => ({
  type: SET_POLKADOTJS_MISSING,
});

export interface SetIsNetworkConnectedPayload { type: string, isConnected: boolean }
export const setIsNetworkConnected = (isConnected: boolean): SetIsNetworkConnectedPayload => ({
  type: SET_NETWORK_CONNECTED,
  isConnected,
});

export interface SetWeb3Payload { type: string, web3: Web3 }
export const setWeb3 = (web3: Web3): SetWeb3Payload => ({
  type: SET_WEB3,
  web3,
});

export interface SetEthContractPayload { type: string, contract: Contract }
export const setEthContract = (contract: any) : SetEthContractPayload => ({
  type: SET_ETH_CONTRACT,
  contract,
});

export interface SetERC20ContractPayload { type: string, contract: Contract }
export const setERC20Contract = (contract: any): SetEthContractPayload => ({
  type: SET_ERC20_CONTRACT,
  contract,
});

export interface SetIncentivizedChannelContractPayload { type: string, contract: Contract }
export const setIncentivizedChannelContract = (contract: any)
  : SetIncentivizedChannelContractPayload => ({
  type: SET_INCENTIVIZED_CHANNEL_CONTRACT,
  contract,
});

export interface SetEthAddressPayload { type: string, address: string }
export const setEthAddress = (address: string): SetEthAddressPayload => ({
  type: SET_ETH_ADDRESS,
  address,
});

export interface SetPolkadotAddressPayload { type: string, address: string }
export const setPolkadotAddress = (address: string): SetPolkadotAddressPayload => ({
  type: SET_POLKADOT_ADDRESS,
  address,
});

export interface SetEthAssetIdPayload { type: string, assetId: any }
export const setEthAssetId = (assetId: any): SetEthAssetIdPayload => ({
  type: SET_ETH_ASSET_ID,
  assetId,
});

export interface SetPolkadotApiPayload { type: string, polkadotApi: ApiPromise }
export const setPolkadotApi = (polkadotApi: ApiPromise): SetPolkadotApiPayload => ({
  type: SET_POLKADOT_API,
  polkadotApi,
});

// Subscribe to Parachain events
export const subscribeEvents = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { polkadotApi } = state.net;

  if (polkadotApi) {
    polkadotApi.query.system.events((eventRecords) => {
      const dispatchEvents = _.filter(eventRecords, (eR) => eR.event.section === 'dispatch');
      dispatchEvents.forEach(({ event }) => {
        const nonce = (event.data as any)[0].nonce.toString();
        // TODO:
        // const dispatchSuccessNotification = (text: string) => this.dispatch(
        // notify({ text, color: "success" })
        // );
        console.log(`Got new dispatch event with nonce: ${nonce}`);
        dispatch(parachainMessageDispatched(nonce));
      });
      // TODO: update new Polkadot account balance
    });
  } else {
    throw new Error('Polkadot API not connected');
  }
};
