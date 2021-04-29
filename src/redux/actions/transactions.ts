/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import { utils } from 'ethers';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Contract } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import Web3 from 'web3';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import {
  Asset, decimals, isDot, isEther, symbols,
} from '../../types/Asset';
import { Chain, SwapDirection } from '../../types/types';
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
import { notify } from './notifications';

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
  direction: SwapDirection,
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
    direction,
  };

  return pendingTransaction;
}

// This will be used in EthTransactions.unlock and PolkadotTransactions.lock
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

// This will be used in EthTransactions.lock and PolkadotTransactions.unlock
// This contains shared logic to update transaction status given a PromiEvent
export function handleEthereumTransactionEvents(
  transactionEvent: PromiEvent<Contract>,
  pendingTransaction: Transaction,
  dispatch: Dispatch<any>,
  web3: Web3,
): void {
  let transactionHash: string;

  transactionEvent
    .once('sending', async (payload: any) => {
      console.log('Sending Transaction', payload);
      // create transaction with default values to display in the modal
      dispatch(setPendingTransaction(pendingTransaction));
    })
    .once('sent', async (payload: any) => {
      console.log('Transaction sent', payload);
    })
    .on('transactionHash', async (hash: string) => {
      console.log('Transaction hash received', hash);
      transactionHash = hash;

      dispatch(
        addTransaction({
          ...pendingTransaction,
          hash,
          confirmations: 0,
          status: TransactionStatus.WAITING_FOR_CONFIRMATION,
        }),
      );

      dispatch(
        notify(
          {
            text: `${
              symbols(pendingTransaction.asset, pendingTransaction.direction).from
            } to ${
              symbols(pendingTransaction.asset, pendingTransaction.direction).to
            } Transaction created`,
          },
        ),
      );
    })
    .on('receipt', async (receipt: any) => {
      console.log('Transaction receipt received', receipt);
      const outChannelLogFields = [
        {
          type: 'address',
          name: 'source',
        },
        {
          type: 'uint64',
          name: 'nonce',
        },
        {
          type: 'bytes',
          name: 'payload',
        },
      ];
      const logIndex = isEther(pendingTransaction.asset) ? 0 : 2;
      const channelEvent = receipt.events[logIndex];
      const decodedEvent = web3.eth.abi.decodeLog(
        outChannelLogFields,
        channelEvent.raw.data,
        channelEvent.raw.topics,
      );
      const { nonce } = decodedEvent;
      dispatch(
        setNonce(transactionHash, nonce),
      );
    })
    .on(
      'confirmation',
      (
        confirmation: number,
        receipt: any,
      ) => {
        // update transaction confirmations
        dispatch(
          updateConfirmations(receipt.transactionHash, confirmation),
        );

        if (confirmation === REQUIRED_ETH_CONFIRMATIONS) {
          dispatch(notify({
            text: `Transactions confirmed after ${confirmation} confirmations`,
            color: 'success',
          }));
          console.log('call transactionEvent.off()');
          // transactionEvent.off('confirmation');
        }
      },
    )
    .on('error', (error: Error) => {
      console.log('error locking tokens', error);
      // TODO: render error message
      dispatch(setPendingTransaction({
        ...pendingTransaction,
        status: TransactionStatus.REJECTED,
      }));

      dispatch(notify({
        text: 'Transaction Error',
        color: 'error',
      }));
      throw error;
    });
}

// shared error handling logic for EthTransactions.unlock and PolkadotTransactions.lock
export function handlePolkadotTransactionErrors(
  error: any,
  pendingTransaction: Transaction,
  dispatch: Dispatch<any>,
): void {
  console.log(':( transaction failed', error);
  if (error.toString() === 'Error: Cancelled') {
    dispatch(
      setPendingTransaction({
        ...pendingTransaction,
        status: TransactionStatus.REJECTED,
        error: 'The transaction was cancelled',
      }),
    );
  } else if (error.message.includes('1014: Priority is too low')) {
    dispatch(
      setPendingTransaction({
        ...pendingTransaction,
        status: TransactionStatus.REJECTED,
        error: 'Please wait for the current pending transaction to complete',
      }),
    );
  } else {
    // display error message in modal
    setPendingTransaction({
      ...pendingTransaction,
      status: TransactionStatus.REJECTED,
      error: error.message,
    });
  }
}
