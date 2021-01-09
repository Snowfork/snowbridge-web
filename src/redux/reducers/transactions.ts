import {
  ADD_TRANSACTION,
  UPDATE_CONFIRMATIONS
} from '../actionsTypes/transactions';
import {AddTransactionPayload, UpdateConfirmationsPayload} from '../actions/transactions'

export enum TransactionStatus {
    SUBMITTING_TO_ETHEREUM = 0,
    WAITING_FOR_CONFIRMATION = 1,
    CONFIRMED_ON_ETHEREUM = 2,
    WAITING_FOR_RELAY = 3,
    RELAYED = 4,
    FINALIZED = 5
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

function transactionsReducer(state = initialState, action: any) {
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
        let transaction = state.transactions.filter((t) => t.hash === action.hash)[0];

        if (transaction.confirmations !== action.confirmations) {
          transaction.confirmations = action.confirmations;
        }
        return Object.assign({}, state, {
          transactions: {...state.transactions, transaction} 
        });
      })(action)
    }

    default:
      return state;
  }
}

export default transactionsReducer;
