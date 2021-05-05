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

export const {
  setAppDotContract,
  setBasicChannelContract,
  setERC20Contract,
  setEthContract,
  setIncentivizedChannelContract,
  setEthAddress,
  setPolkadotAddress,
  setMetamaskMissing,
  setMetamaskNetwork,
  setNetworkConnected,
  setPolkadotApi,
  setPolkadotjsMissing,
  setWeb3,
} = netSlice.actions;

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
        console.log('parachain message dispatched', nonce);
        dispatch(parachainMessageDispatched(nonce));
      });
    });
  } else {
    throw new Error('Polkadot API not connected');
  }
};
