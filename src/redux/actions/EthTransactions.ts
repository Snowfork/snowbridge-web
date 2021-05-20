/* eslint-disable @typescript-eslint/ban-types */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import { MessageDispatchedEvent } from 'asset-transfer-sdk/lib/types';
import { RootState } from '../store';
import {
  setPendingTransaction,
  createTransaction,
  handleEthereumTransactionEvents,
  handlePolkadotTransactionErrors,
  addTransaction,
  updateTransaction,
  setTransactionStatus,
  ethMessageDispatched,
} from './transactions';
import EthApi from '../../net/eth';
import { setEthAddress } from './net';
import { Chain, SwapDirection } from '../../types/types';
import { TransactionStatus } from '../reducers/transactions';
import { setShowConfirmTransactionModal, setShowTransactionList } from './bridge';
import { isDot } from '../../types/Asset';

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
              amount,
              selectedAsset!.address,
              ethAddress!,
              polkadotAddress!,
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

    const onReady = (result: any) => {
      const hash = (Math.random() * 100).toString();
      pendingTransaction = { ...pendingTransaction, hash, status: TransactionStatus.WAITING_FOR_CONFIRMATION };

      dispatch(
        addTransaction(
          pendingTransaction,
        ),
      );
      dispatch(setShowConfirmTransactionModal(false));
      dispatch(setShowTransactionList(true));
    };

    const onInBlock = (result: any) => {
      let nonce = result.events[0].event.data[0].toString();

      if (isDot(pendingTransaction.asset)) {
        nonce = result.events[1].event.data[0].toString();
      }

      pendingTransaction = {
        ...pendingTransaction,
        nonce,
        status: TransactionStatus.WAITING_FOR_RELAY,
      };

      dispatch(
        updateTransaction(
          {
            hash: pendingTransaction.hash,
            update: pendingTransaction,
          },
        ),
      );
    };

    const onFinalized = (result: any) => {
      dispatch(
        setTransactionStatus({
          hash: pendingTransaction.hash,
          status: TransactionStatus.WAITING_FOR_RELAY,
        }),
      );
    };

    const onChannelMessageDispatched = (event: MessageDispatchedEvent) => {
      if (
        event.returnValues.nonce === pendingTransaction.nonce
      ) {
        dispatch(
          ethMessageDispatched({
            nonce: event.returnValues.nonce,
            dispatchTransactionNonce: pendingTransaction.nonce!,
          }),
        );
      }
    };

    await sdk?.ethClient?.unlock(
      amount,
      selectedAsset!.address,
      polkadotAddress!,
      ethAddress!,
      onReady,
      onInBlock,
      onFinalized,
      onChannelMessageDispatched,
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
