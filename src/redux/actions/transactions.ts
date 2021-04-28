/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import { utils } from 'ethers';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Contract } from 'web3-eth-contract';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import {
  Asset, decimals, isDot, isEther,
} from '../../types/Asset';
import { Chain } from '../../types/types';
import {
  ADD_TRANSACTION,
  SET_CONFIRMATIONS,
  SET_NONCE,
  SET_TRANSACTION_STATUS,
  POLKA_ETH_BURNED,
  SET_PENDING_TRANSACTION,
  PARACHAIN_MESSAGE_DISPATCHED,
  ETH_MESSAGE_DISPATCHED_EVENT,
  UPDATE_TRANSACTION,
} from '../actionsTypes/transactions';
import { RootState } from '../reducers';
import {
  MessageDispatchedEvent,
  PolkaEthBurnedEvent, Transaction, TransactionStatus,
} from '../reducers/transactions';
import { doEthTransfer } from './EthTransactions';
import { doPolkadotTransfer } from './PolkadotTransactions';

export interface AddTransactionPayload { type: string, transaction: Transaction }
export const addTransaction = (transaction: Transaction): AddTransactionPayload => ({
  type: ADD_TRANSACTION,
  transaction,
});

export interface SetConfirmationsPayload { type: string, hash: string, confirmations: number }
export const setConfirmations = (hash: string, confirmations: number)
  : SetConfirmationsPayload => ({
  type: SET_CONFIRMATIONS,
  hash,
  confirmations,
});

export interface SetNoncePayload { type: string, hash: string, nonce: string }
export const setNonce = (hash: string, nonce: string): SetNoncePayload => ({
  type: SET_NONCE,
  hash,
  nonce,
});

export interface SetTransactionStatusPayload {
  type: string,
  hash: string,
  status: TransactionStatus
}
export const setTransactionStatus = (hash: string, status: TransactionStatus)
  : SetTransactionStatusPayload => ({
  type: SET_TRANSACTION_STATUS,
  hash,
  status,
});

export interface UpdateTransactionPayload { type: string, hash: string, updates: any }
export const updateTransaction = (hash: string, updates: any): UpdateTransactionPayload => ({
  type: UPDATE_TRANSACTION,
  hash,
  updates,
});

export interface ParachainMessageDispatchedPayload { type: string, nonce: string }
export const parachainMessageDispatched = (nonce: string): ParachainMessageDispatchedPayload => ({
  type: PARACHAIN_MESSAGE_DISPATCHED,
  nonce,
});

export interface EthMessageDispatchedPayload {
  type: string,
  nonce: string,
  dispatchTransactionHash: string
}
export const ethMessageDispatched = (nonce: string, dispatchTransactionHash: string)
  : EthMessageDispatchedPayload => ({
  type: ETH_MESSAGE_DISPATCHED_EVENT,
  nonce,
  dispatchTransactionHash,
});

export interface PolkaEthBurnedPayload { type: string, event: PolkaEthBurnedEvent }
export const polkaEthBurned = (event: PolkaEthBurnedEvent): PolkaEthBurnedPayload => ({
  type: POLKA_ETH_BURNED,
  event,
});

export interface SetPendingTransactionPayload { type: string, transaction: Transaction }
export const setPendingTransaction = (transaction: Transaction): SetPendingTransactionPayload => ({
  type: SET_PENDING_TRANSACTION,
  transaction,
});

export const updateConfirmations = (
  hash: string, confirmations: number,
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  if (
    confirmations >= REQUIRED_ETH_CONFIRMATIONS
  ) {
    dispatch(setTransactionStatus(hash, TransactionStatus.WAITING_FOR_RELAY));
  }
  dispatch(setConfirmations(hash, confirmations));
};

export const doTransfer = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = state.bridge;

  const { from } = decimals(selectedAsset!, swapDirection);
  const fromDecimals = utils.parseUnits(depositAmount, from).toString();
  const amount = fromDecimals;

  // transaction direction logic
  if (!isDot(selectedAsset!)) {
    dispatch(doEthTransfer(amount));
  } else {
    dispatch(doPolkadotTransfer(amount));
  }
};

// Transaction factory function
export function createTransaction(
  sender: string,
  receiver: string,
  amount: string,
  chain: Chain,
  asset: Asset,
): Transaction {
  const pendingTransaction: Transaction = {
    hash: '',
    confirmations: 0,
    sender,
    receiver,
    amount,
    status: TransactionStatus.SUBMITTING_TO_CHAIN,
    isMinted: false,
    isBurned: false,
    chain,
    asset,
  };

  return pendingTransaction;
}

// This will be use in EthTransactions.burn and PolkadotTransactions.lock
// This is shared logic that will:
//  be used as a callback for polkadot transaction events
//  update the transaction state
//  wait for the transaction to be finalized and then unsubscribe
//
//  This also subscribes to basicChannelContract events to watch
//  the transaction status on the eth side
export function handlePolkadotTransactionEvents(
  result: any, // event data from polkadot transaction subscription
  unsub: any, // function to unsubscribe from polkadot transaction events
  transaction: Transaction, // the transaction we are updating for each event
  dispatch: Dispatch<any>,
  incentivizedChannelContract: Contract,
  basicChannelContract: Contract,
): void {
  const pendingTransaction = transaction;

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
    let nonce = result.events[1].event.data[0].toString();
    if (isEther(transaction.asset)) {
      nonce = result.events[0].event.data[0].toString();
    }

    dispatch(
      updateTransaction(
        pendingTransaction.hash, { nonce, status: TransactionStatus.WAITING_FOR_RELAY },
      ),
    );

    const handleChannelMessageDispatched = (event: MessageDispatchedEvent) => {
      if (
        event.returnValues.nonce === nonce
      ) {
        dispatch(
          ethMessageDispatched(event.returnValues.nonce, pendingTransaction.nonce!),
        );
      }
    };

    // subscribe to ETH dispatch event
    // eslint-disable-next-line no-unused-expressions
    incentivizedChannelContract
      .events
      .MessageDispatched({})
      .on('data', handleChannelMessageDispatched);

    // TODO: replace with incentivized channel?
    // eslint-disable-next-line no-unused-expressions
    basicChannelContract
      .events
      .MessageDispatched({})
      .on('data', handleChannelMessageDispatched);

    return;
  }

  if (result.status.isFinalized) {
    console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
    dispatch(
      setTransactionStatus(pendingTransaction.hash, TransactionStatus.WAITING_FOR_RELAY),
    );
    // unsubscribe from transaction events
    // unsub();
  }
}
