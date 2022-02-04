/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-types */

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
