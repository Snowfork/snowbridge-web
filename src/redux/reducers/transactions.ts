/* eslint-disable no-param-reassign */
import { EventData } from 'web3-eth-contract';
import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { Asset } from '../../types/Asset';
import { Chain, SwapDirection } from '../../types/types';
import { RootState } from '../store';

export enum TransactionStatus {
  // used for error states
  REJECTED = -1,
  // used when waiting for confirmation from chain
  SUBMITTING_TO_CHAIN = 0,
  // transaction hash recieved
  WAITING_FOR_CONFIRMATION = 1,
  // used when the eth transaction is confirmed
  // and we are waiting to reach the confirmation threshold
  CONFIRMING = 2,
  // transaction finalized (for eth, when we reach enough confirmations.
  // for parachain, when tx finalized)
  FINALIZED_ON_CHAIN = 3,
  // waiting for 'MessageDispatch' event on polkadot for eth transactions
  // or waiting for 'MessageDispatched' event on Ethereum for polkadot transactions
  WAITING_FOR_RELAY = 4,
  // message dispatched on polkadot
  RELAYED = 5,
  // transaction dispatched to second chain
  DISPATCHED = 6
}

export interface Transaction {
  hash: string;
  nonce?: string;
  confirmations: number;
  sender: string;
  receiver: string;
  amount: string;
  status: TransactionStatus;
  isMinted: boolean;
  isBurned: boolean;
  chain: Chain;
  dispatchTransactionHash?: string;
  error?: string;
  asset: Asset;
  direction: SwapDirection
}

// Interface for the Ethereum 'MessageDispatched' event,
// emitted by the Incentivized Channel smart contract
export interface MessageDispatchedEvent extends EventData {
  returnValues: { nonce: string, result: boolean }
}

// Interface for an PolkaEth 'Burned' event, emitted by the parachain
export interface PolkaEthBurnedEvent {
  accountId: string;
  amount: string;
}

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
      console.log('add tx', action);
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
      console.log('update tx', current(state.transactions));
      let transaction = state.transactions.filter((tx) => tx.hash === action.payload.hash)[0];
      console.log('update tx', action);
      if (transaction) {
        console.log('update tx', action.payload.update);
        transaction = {
          ...transaction,
          ...action.payload.update,
        };
      } else {
        console.log('no tx matches');
      }
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
