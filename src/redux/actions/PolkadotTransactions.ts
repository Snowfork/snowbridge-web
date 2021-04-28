/* eslint-disable @typescript-eslint/ban-types */

import { web3FromSource } from '@polkadot/extension-dapp';
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import { RootState } from '../reducers';
import { TransactionStatus, MessageDispatchedEvent, Transaction } from '../reducers/transactions';
import {
  setPendingTransaction,
  addTransaction,
  updateTransaction,
  ethMessageDispatched,
  setTransactionStatus,
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
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  try {
    // TODO: use incentivized channel?
    const channelId = 0;
    const account = await (await Polkadot.getAddresses()).filter(({ address }) => address === polkadotAddress)[0];
    // to be able to retrieve the signer interface from this account
    // we can use web3FromSource which will return an InjectedExtension type
    const injector = await web3FromSource(account.meta.source);
    const pendingTransaction: Transaction = {
      hash: '',
      confirmations: 0,
      sender: polkadotAddress!,
      receiver: ethAddress!,
      amount,
      status: TransactionStatus.SUBMITTING_TO_CHAIN,
      isMinted: false,
      isBurned: false,
      chain: Chain.POLKADOT,
      asset: selectedAsset!,
    };
    console.log('lock DOT', pendingTransaction);

    dispatch(setPendingTransaction(pendingTransaction));

    // TODO: move this to the API
    const unsub = await polkadotApi?.tx.dot.lock(channelId, ethAddress, amount)
      .signAndSend(account.address, { signer: injector.signer }, (result) => {
        if (result.status.isReady) {
          pendingTransaction.hash = result.status.hash.toString();
          dispatch(
            addTransaction(
              { ...pendingTransaction, status: TransactionStatus.WAITING_FOR_CONFIRMATION },
            ),
          );
          return;
        }
        if (result.status.isInBlock) {
          const nonce = result.events[1].event.data[0].toString();
          dispatch(
            updateTransaction(
              pendingTransaction.hash, { nonce, status: TransactionStatus.WAITING_FOR_RELAY },
            ),
          );

          // TODO: replace with incentivized channel?
          // eslint-disable-next-line no-unused-expressions
          basicChannelContract?.events.MessageDispatched({})
            .on('data', (
              event: MessageDispatchedEvent,
            ) => {
              if (
                event.returnValues.nonce === nonce
              ) {
                dispatch(
                  ethMessageDispatched(event.returnValues.nonce, pendingTransaction.nonce!),
                );
              }
            });

          return;
        }

        if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
          dispatch(
            setTransactionStatus(pendingTransaction.hash, TransactionStatus.WAITING_FOR_RELAY),
          );
          if (unsub) {
            // unsub();
          }
        }
      }).catch((err) => {
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
