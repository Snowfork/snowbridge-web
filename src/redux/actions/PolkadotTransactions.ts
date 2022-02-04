/* eslint-disable @typescript-eslint/ban-types */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { RootState } from '../store';
import {
  setPendingTransaction,
  createTransaction,
  handlePolkadotTransactionEvents,
  handleEthereumTransactionEvents,
  handlePolkadotTransactionErrors,
} from './transactions';
import Polkadot from '../../net/polkadot';
import { Chain, SwapDirection } from '../../types/types';
import { isNonFungible, NonFungibleToken } from '../../types/Asset';
import { ACTIVE_CHANNEL } from '../../config';

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
      incentivizedInboundChannelContract,
    } = state.net;
    const {
      selectedAsset,
    } = state.bridge;

    try {
      let pendingTransaction = createTransaction(
        polkadotAddress!,
        ethAddress!,
        amount,
        Chain.POLKADOT,
        selectedAsset!,
        SwapDirection.PolkadotToEthereum,
        ACTIVE_CHANNEL,
      );
      dispatch(setPendingTransaction(pendingTransaction));
      const token = selectedAsset?.token as NonFungibleToken;
      const subTokenId = Number(token.subId);

      if (isNonFungible(selectedAsset!)) {
        const unsub = await Polkadot.burnERC721(
          polkadotApi!, subTokenId, polkadotAddress!, ethAddress!, ACTIVE_CHANNEL,
          (res: any) => {
            const tx = handlePolkadotTransactionEvents(
              res,
              unsub!,
              pendingTransaction,
              dispatch,
              incentivizedInboundChannelContract!,
              basicChannelContract!,
            );

            // tx will be updated in handlePolkadotTransactionEvents
            // write this to pendingTransaction so it can
            // have the latest values for the next iteration
            pendingTransaction = tx;
          })
          .catch((error: any) => {
            console.log('error in sub for nft tx', error);
            handlePolkadotTransactionErrors(
              error,
              pendingTransaction,
              dispatch,
            );
          });
      } else {
        const unsub = await Polkadot.lockDot(
          polkadotApi!,
          ethAddress!,
          polkadotAddress!,
          amount,
          ACTIVE_CHANNEL,
          (res: any) => {
            const tx = handlePolkadotTransactionEvents(
              res,
              unsub!,
              pendingTransaction,
              dispatch,
              incentivizedInboundChannelContract!,
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
      }
    } catch (err) {
      // Todo: Error Sending DOT
      console.log('error sending tokens from polkadot');
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
      appDotContract,
      ethAddress,
      polkadotAddress,
      web3,
    } = state.net;
    try {
      const pendingTransaction = createTransaction(
        ethAddress!,
        polkadotAddress!,
        amount,
        Chain.POLKADOT,
        state.bridge.selectedAsset!,
        state.bridge.swapDirection!,
        ACTIVE_CHANNEL,
      );
      dispatch(setPendingTransaction(pendingTransaction));

      const transactionEvent = Polkadot.unlockDot(
        appDotContract!,
        ethAddress!,
        polkadotAddress!,
        amount,
        ACTIVE_CHANNEL,
      );

      handleEthereumTransactionEvents(
        transactionEvent,
        pendingTransaction,
        dispatch,
        web3!,
      );
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
