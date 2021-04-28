/* eslint-disable @typescript-eslint/ban-types */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import { RootState } from '../reducers';
import { TransactionStatus } from '../reducers/transactions';
import {
  setPendingTransaction,
  createTransaction,
  handlePolkadotTransactionEvents,
} from './transactions';
import Polkadot from '../../net/polkadot';
import { ss58ToU8 } from '../../net/api';
import { SET_POLKADOT_GAS_BALANCE } from '../actionsTypes/transactions';
import { Chain, SwapDirection } from '../../types/types';

/**
 * Locks tokens on Polkadot and mints tokens on Ethereum
 * @param {amount} string The amount of tokens (in base units) to lock
 * @return {Promise<void>}
 */
export const lockPolkadotAsset = (
  amount: string,
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    ethAddress,
    polkadotApi,
    polkadotAddress,
    basicChannelContract,
    incentivizedChannelContract,
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  try {
    const pendingTransaction = createTransaction(
      polkadotAddress!,
      ethAddress!,
      amount,
      Chain.POLKADOT,
      selectedAsset!,
    );
    dispatch(setPendingTransaction(pendingTransaction));

    const unsub = Polkadot.lockDot(
      polkadotApi!,
      ethAddress!,
      polkadotAddress!,
      amount,
      (res: any) => {
        handlePolkadotTransactionEvents(
          res,
            unsub!,
            pendingTransaction,
            dispatch,
            incentivizedChannelContract!,
            basicChannelContract!,
        );
      },
    )
      .catch((err) => {
        // display error message in modal
        setPendingTransaction({
          ...pendingTransaction,
          status: TransactionStatus.REJECTED,
          error: err.message,
        });
      });
  } catch (err) {
    // Todo: Error Sending DOT
    console.log(err);
  }
};

/**
 * Burns tokens on Ethereum and unlocks tokens on Polkadot
 * @param {amount} string The amount of tokens (in base units) to lock
 * @return {Promise<void>}
 */
export const unlockPolkadotAsset = (
  amount: string,
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    appDotContract, ethAddress, polkadotAddress,
  } = state.net;
  try {
    const amountWrapped = Web3.utils.toBN(amount);
    console.log('burn DOT', amountWrapped.toString());

    // TODO: move to API
    const recipientBytes = ss58ToU8(polkadotAddress!);
    await appDotContract?.methods.burn(
      recipientBytes,
      amountWrapped,
      //  TODO: set channel ID?
      0,
    )
      .send({
        from: ethAddress,
        gas: 500000,
        value: 0,
      });
  } catch (err) {
    // Todo: Error Sending Ethereum
    console.log(err);
  }
};

export const doPolkadotTransfer = (amount: string):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    swapDirection,
  } = state.bridge;

  if (swapDirection === SwapDirection.PolkadotToEthereum) {
    dispatch(lockPolkadotAsset(amount));
  } else {
    dispatch(unlockPolkadotAsset(amount));
  }
};

export interface SetPolkadotGasBalancePayload { type: string, balance: string }
export const setPolkadotGasBalance = (balance: string): SetPolkadotGasBalancePayload => ({
  type: SET_POLKADOT_GAS_BALANCE,
  balance,
});

export const fetchPolkadotGasBalance = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { polkadotApi, polkadotAddress } = state.net;

  if (polkadotApi && polkadotAddress) {
    const balance = await Polkadot.getGasCurrencyBalance(polkadotApi, polkadotAddress);
    dispatch(setPolkadotGasBalance(balance));
  } else {
    throw new Error('Unable to fetch polkadot balance');
  }
};
