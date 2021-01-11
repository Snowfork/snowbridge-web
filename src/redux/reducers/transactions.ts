import {
  ADD_TRANSACTION,
  UPDATE_CONFIRMATIONS,
  SET_TRANSACTION_STATUS,
  POLKA_ETH_MINTED,
  POLKA_ETH_BURNED
} from '../actionsTypes/transactions';
import {
  AddTransactionPayload,
  SetTransactionStatusPayload,
  UpdateConfirmationsPayload,
  PolkaEthMintedPayload,
  PolkaEthBurnedPayload
} from '../actions/transactions'

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
  isMinted: boolean,
  isBurned: boolean
}

// Interface for an PolkaEth 'Minted' event, emitted by the parachain
export interface PolkaEthMintedEvent {
  accountId: string;
  amount: string;
}

// Interface for an PolkaEth 'Burned' event, emitted by the parachain
export interface PolkaEthBurnedEvent {
  accountId: string;
  amount: string;
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
          transactions: [...state.transactions, action.transaction],
        });
      })(action)
    }
    case UPDATE_CONFIRMATIONS: {
      return ((action: UpdateConfirmationsPayload) => {
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) => t.hash === action.hash ? { ...t, confirmations: action.confirmations } : t)
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
    // TODO: Properly map Eth submitted assets to minted assets
    // Called when an PolkaEth asset has been minted by the parachain
    case POLKA_ETH_MINTED: {
      return ((action: PolkaEthMintedPayload) => {
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) =>
            (t.amount === action.event.amount
            && t.receiver === action.event.accountId)
            ? { ...t, isMinted: true, status: TransactionStatus.RELAYED }
            : t
          )
        });
      })(action)
    }
    // TODO: Properly map PolkaEth submitted assets to burned assets
    // Called when an PolkaEth asset has been burned by the parachain
    case POLKA_ETH_BURNED: {
      return ((action: PolkaEthBurnedPayload) => {
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) =>
            (t.amount === action.event.amount
            && t.receiver === action.event.accountId)
            ? { ...t, isBurned: true}
            : t
          )
        });
      })(action)
    }
    default:
      return state
  }
}

export default transactionsReducer;
