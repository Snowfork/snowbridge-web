/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  TransactionStatus,
  Transaction,
} from 'asset-transfer-sdk/lib/types';
import { } from 'asset-transfer-sdk/lib/utils';

import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { RootState } from '../store';

export interface TransactionsState {
  transactions: Transaction[],
  pendingTransaction?: Transaction,
}

const initialState: TransactionsState = {
  transactions: [],
  pendingTransaction: undefined,
};

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      // append to tx list
      state.transactions.push(action.payload);
      // update pending tx
      state.pendingTransaction = action.payload;
    },
    setConfirmations: (state, action: PayloadAction<{confirmations: number, hash: string}>) => {
      const getTransactionStatus = (transaction: Transaction): TransactionStatus => {
        // check if the transaction has already been relayed to polkadot
        if (action.payload.confirmations >= REQUIRED_ETH_CONFIRMATIONS) {
          if (transaction.isMinted) {
            return TransactionStatus.RELAYED;
          }
          return TransactionStatus.WAITING_FOR_RELAY;
        }
        return TransactionStatus.CONFIRMING;
      };

      const transaction = state.transactions.filter((tx) => tx.hash === action.payload.hash)[0];

      if (transaction) {
        transaction.confirmations = action.payload.confirmations;
        const status = getTransactionStatus(transaction as Transaction);
        if (status > transaction.status) {
          transaction.status = status;
        }
      }
    },
    setTransactionStatus: (state, action: PayloadAction<{hash: string, status: TransactionStatus}>) => {
      const transaction = state.transactions.filter((tx) => tx.hash === action.payload.hash)[0];

      if (transaction) {
        if (transaction.status < action.payload.status) {
          transaction.status = action.payload.status;
        }
      }
    },
    updateTransaction: (state, action: PayloadAction<{hash: string, update: Partial<Transaction>}>) => {
      state.transactions = state.transactions.map((tx) => (tx.hash === action.payload.hash ? { ...tx, ...action.payload.update } : tx));
    },
    setNonce: (state, action: PayloadAction<{hash: string, nonce: string}>) => {
      const transaction = state.transactions.filter((tx) => tx.hash === action.payload.hash)[0];

      if (transaction) {
        transaction.nonce = action.payload.nonce;
      }
    },
    parachainMessageDispatched: (state, action: PayloadAction<{nonce: string}>) => {
      const transaction = state.transactions.filter((tx) => tx.nonce === action.payload.nonce)[0];
      if (transaction) {
        transaction.isMinted = true;
        transaction.status = TransactionStatus.DISPATCHED;
      }
    },
    // polkaEthBurned: (state, action: PayloadAction<PolkaEthBurnedEvent>) => {
    //   console.log('reducer got polkaeth burned!', action);
    //   // const transaction = state.transactions.filter((tx) => tx.nonce === action.payload.nonce)[0];
    // },
    setPendingTransaction: (state, action: PayloadAction<Transaction>) => {
      state.pendingTransaction = action.payload;
    },
    ethMessageDispatched: (state, action: PayloadAction<{nonce: string, dispatchTransactionNonce: string}>) => {
      const transaction = state.transactions.filter((tx) => tx.nonce === action.payload.nonce)[0];
      if (transaction) {
        transaction.status = TransactionStatus.DISPATCHED;
        transaction.dispatchTransactionHash = action.payload.dispatchTransactionNonce;
      }
    },
  },
});

export default transactionsSlice.reducer;

export const transactionsInProgressSelector = (state: RootState): Transaction[] => state
  .transactions
  .transactions
  .filter((tx) => tx.status < TransactionStatus.DISPATCHED);
