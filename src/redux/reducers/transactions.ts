import {
  ADD_TRANSACTION,
  UPDATE_CONFIRMATIONS,
  SET_TRANSACTION_STATUS
} from '../actionsTypes/transactions';
import { AddTransactionPayload, SetTransactionStatusPayload, UpdateConfirmationsPayload } from '../actions/transactions'

export enum TransactionStatus {
    SUBMITTING_TO_ETHEREUM = 0,
    WAITING_FOR_CONFIRMATION = 1,
    CONFIRMING = 2,
    CONFIRMED_ON_ETHEREUM = 3,
    WAITING_FOR_RELAY = 4,
    RELAYED = 5,
    FINALIZED = 6
}

export interface Transaction {
    hash: string;
    confirmations: number;
    sender: string;
    receiver: string;
    amount: string;
    chain: 'eth' | 'polkadot';
    status: TransactionStatus
}

export interface TransactionsState {
  transactions: Transaction[]
}

const initialState: TransactionsState = {
    transactions: []
};

function transactionsReducer(state: TransactionsState = initialState, action: any) {
  switch (action.type) {
    case ADD_TRANSACTION: {
      return ((action: AddTransactionPayload) => { 
        return Object.assign({}, state, {
          transactions: [...state.transactions, action.transaction ],
        });
      })(action)
    }
    case UPDATE_CONFIRMATIONS: {
      return ((action: UpdateConfirmationsPayload) => {
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) => t.hash === action.hash ? {...t, confirmations: action.confirmations} : t)
        });
      })(action)
    }
    case SET_TRANSACTION_STATUS: {
      return ((action: SetTransactionStatusPayload) => {
           return Object.assign({}, state, {
          transactions: state.transactions.map((t) => t.hash === action.hash ? { ...t, status: action.status } : t)
        });
      })(action)
    }

    default:
      return state;
  }
}

export default transactionsReducer;
