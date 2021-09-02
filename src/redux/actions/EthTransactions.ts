/* eslint-disable @typescript-eslint/ban-types */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import { RootState } from '../store';
import {
  setPendingTransaction,
  createTransaction,
  handlePolkadotTransactionEvents,
  handleEthereumTransactionEvents,
  handlePolkadotTransactionErrors,
} from './transactions';
import EthApi from '../../net/eth';
import { setEthAddress } from './net';
import { Chain, SwapDirection } from '../../types/types';

/**
 * Locks tokens on Ethereum and mints tokens on Polkadot
 * @param {amount} string The amount of tokens (in base units) to lock
 * @return {Promise<void>}
 */
export const lockEthAsset = (
  amount: string,
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    ethContract,
    erc20Contract,
    web3,
    ethAddress,
    polkadotAddress,
    erc721AppContract,
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  try {
    if (ethAddress) {
      if (web3 && ethContract && erc20Contract) {
        const pendingTransaction = createTransaction(
            ethAddress!,
            polkadotAddress!,
            amount,
            Chain.ETHEREUM,
            selectedAsset!,
            SwapDirection.EthereumToPolkadot,
        );
        dispatch(setPendingTransaction(pendingTransaction));

        const transactionEvent: any = EthApi.lock(
          amount,
            selectedAsset!,
            ethAddress!,
            polkadotAddress!,
            ethContract,
            erc20Contract,
            erc721AppContract!,
        );

        handleEthereumTransactionEvents(
          transactionEvent,
          pendingTransaction,
          dispatch,
          web3,
        );
      }
    } else {
      throw new Error('Default Address not found');
    }
  } catch (err) {
    // Todo: Error Sending Ethereum
    console.log(err);
  }
};

// burns asset on polkadot and unlocks on ethereum
export const unlockEthAsset = (amount: string):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    polkadotApi,
    polkadotAddress,
    incentivizedChannelContract,
    ethAddress,
    basicChannelContract,
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  if (polkadotApi) {
    let pendingTransaction = createTransaction(
        polkadotAddress!,
        ethAddress!,
        amount,
        Chain.POLKADOT,
        selectedAsset!,
        SwapDirection.PolkadotToEthereum,
    );
      // set pending to open pending tx status modal
    await dispatch(setPendingTransaction(pendingTransaction));

    const unsub = await EthApi.unlock(
      amount,
      selectedAsset!,
      polkadotAddress!,
      ethAddress!,
      polkadotApi,
      (result: any) => {
        const tx = handlePolkadotTransactionEvents(
          result,
          unsub,
          pendingTransaction,
          dispatch,
          incentivizedChannelContract!,
          basicChannelContract!,
        );

        // tx will be updated in handlePolkadotTransactionEvents
        // write this to pendingTransaction so it can
        // have the latest values for the next iteration
        pendingTransaction = tx;
      },
    )
      .catch((error: any) => {
        handlePolkadotTransactionErrors(
          error,
          pendingTransaction,
          dispatch,
        );
      });
  } else {
    throw new Error('Polkadot API not connected');
  }
};

export const doEthTransfer = (amount: string):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    swapDirection,
  } = state.bridge;
  if (swapDirection === SwapDirection.EthereumToPolkadot) {
    dispatch(lockEthAsset(amount));
  } else {
    dispatch(unlockEthAsset(amount));
  }
};

export const fetchEthAddress = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const web3: Web3 = state.net.web3!;

  const address = await EthApi.getAddress(web3);
  dispatch(setEthAddress(address));
};
