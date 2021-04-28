/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import { utils } from 'ethers';
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { isDot } from '../../types/Asset';
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
  } = state.bridge;

  const amount = utils.parseUnits(depositAmount, selectedAsset?.decimals).toString();

  // transaction direction logic
  if (!isDot(selectedAsset!)) {
    dispatch(doEthTransfer(amount));
  } else {
    dispatch(doPolkadotTransfer(amount));
  }
};
