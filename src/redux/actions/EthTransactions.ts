/* eslint-disable @typescript-eslint/ban-types */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import {
  Chain,
  SwapDirection,
  Transaction,
} from 'asset-transfer-sdk/lib/types';
import { RootState } from '../store';
import {
  setPendingTransaction,
  createTransaction,
  handleEthereumTransactionEvents,
  handlePolkadotTransactionErrors,
  onChannelMessageDispatched,
  onFinalized,
  onInBlock,
  onReady,
} from './transactions';
import EthApi from '../../net/eth';
import { setEthAddress } from './net';

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
    web3,
    ethAddress,
    polkadotAddress,
    sdk,
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  try {
    if (ethAddress) {
      if (web3) {
        const pendingTransaction = createTransaction(
            ethAddress!,
            polkadotAddress!,
            amount,
            Chain.ETHEREUM,
            selectedAsset!,
            SwapDirection.EthereumToPolkadot,
        );
        dispatch(setPendingTransaction(pendingTransaction));

        if (sdk) {
          const transactionEvent: any = sdk
            .ethClient!.lock(
              pendingTransaction,
            );

          handleEthereumTransactionEvents(
            transactionEvent,
            pendingTransaction,
            dispatch,
            web3,
          );
        }
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
    ethAddress,
    sdk,
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  if (polkadotApi) {
    const pendingTransaction = createTransaction(
        polkadotAddress!,
        ethAddress!,
        amount,
        Chain.POLKADOT,
        selectedAsset!,
        SwapDirection.PolkadotToEthereum,
    );
      // set pending to open pending tx status modal
    await dispatch(setPendingTransaction(pendingTransaction));

    await sdk?.ethClient?.unlock(
      pendingTransaction,
      (tx: Transaction) => onReady(tx, dispatch),
      (tx: Transaction) => onInBlock(tx, dispatch),
      (tx: Transaction) => onFinalized(tx, dispatch),
      (tx: Transaction) => onChannelMessageDispatched(tx, dispatch),
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
