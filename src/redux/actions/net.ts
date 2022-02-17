/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-types */
import Web3 from 'web3';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import _ from 'lodash';
import { RootState } from '../store';
import {
  parachainMessageDispatched,
} from './transactions';
import {
  netSlice,
} from '../reducers/net';
import { Channel } from '../../types/types';
import { transactionsSlice } from '../../redux/reducers/transactions';
import {
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  ETHEREUM_WEB_SOCKET__PROVIDER
} from '../../config'

export const {
  ethMessageDispatched
} = transactionsSlice.actions;
export const {
  setAppDotContract,
  setBasicChannelContract,
  setERC20Contract,
  setEthContract,
  setIncentivizedInboundChannelContract,
  setIncentivizedOutboundChannelContract,
  setEthAddress,
  setPolkadotAddress,
  setMetamaskNetwork,
  setNetworkConnected,
  setPolkadotApi,
  setPolkadotRelayApi,
  setPolkadotjsMissing,
  setWeb3,
  setErc721AppContract,
} = netSlice.actions;

// Subscribe to Parachain events
export const subscribeEvents = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
  ): Promise<void> => {
    const state = getState() as RootState;
    const { polkadotApi } = state.net;
    if (polkadotApi) {
      polkadotApi.query.system.events((eventRecords:any) => {
        const dispatchEvents = _.filter(eventRecords, (eR) => eR.event.section === 'dispatch');
        dispatchEvents.forEach(({ event }) => {
          const nonce = (event.data as any)[0].nonce.toString();
          const channelId = (event.data as any)[0].channelId.toString();
          const channel = channelId === 'Incentivized' ? Channel.INCENTIVIZED : Channel.BASIC;
          // TODO:
          // const dispatchSuccessNotification = (text: string) => this.dispatch(
          // notify({ text, color: "success" })
          // );
          console.log(`Parachain message dispatched - Nonce: ${nonce}, Channel: ${channel}`);
          dispatch(parachainMessageDispatched({ nonce, channel }));
        });
      });
    } else {
      throw new Error('Polkadot API not connected');
    }
  };

//Subscribe to events of Inbound channel ethereum contracts.
export const subscribeEthereumEvents = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
  ): Promise<void> => {
    try {
      console.log("insideSubscribeEthereumEents");
      const state = getState() as RootState;

      var web3 = new Web3(
        new Web3.providers.WebsocketProvider(ETHEREUM_WEB_SOCKET__PROVIDER)
      );

      let channel: Channel;
      let basicInChannelLogFields = [
        {
          indexed: false,
          internalType: "uint64",
          name: "nonce",
          type: "uint64",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "result",
          type: "bool",
        },
      ];
      var subscription = web3.eth.subscribe('logs', {
        address: [BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS, INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS],
        topics: ['0x504b093d860dc827c72a879d052fd8ac6b4c2af80c5f3a634654f172690bf10a']
      }, function (error: any, event: any) {
        if (error) {
          return ''
        }
        console.log("err", error);
        console.log("event", event);
        const decodedEvent = web3.eth.abi.decodeLog(
          basicInChannelLogFields,
          event.data,
          event.topics,
        );
        console.log('nonce ', decodedEvent.nonce);
        console.log('decodeEventResult ', decodedEvent.result);
        if (event.address == BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS)
          channel = Channel.BASIC

        if (event.address == INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS)
          channel = Channel.INCENTIVIZED

        dispatch(
          ethMessageDispatched({
            nonce: decodedEvent.nonce,
            channel
          }),
        );


      });
      
    } catch (error) {
      console.error("errorMessage", error);
    }
  };
