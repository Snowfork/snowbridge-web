import {
  ADD_TRANSACTION,
  UPDATE_CONFIRMATIONS,
  SET_NONCE,
  SET_TRANSACTION_STATUS,
  PARACHAIN_MESSAGE_DISPATCHED,
  POLKA_ETH_BURNED,
  SET_PENDING_TRANSACTION,
  ETH_UNLOCKED_EVENT
} from '../actionsTypes/transactions';
import {
  AddTransactionPayload,
  SetTransactionStatusPayload,
  UpdateConfirmationsPayload,
  ParachainMessageDispatchedPayload,
  PolkaEthBurnedPayload,
  SetPendingTransactionPayload,
  EthUnlockEventPayload,
  SetNoncePayload
} from '../actions/transactions'
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { EventData } from 'web3-eth-contract';

export enum TransactionStatus {
  // used for error states
  REJECTED = -1,
  // used when waiting for confirmation in metamask
  SUBMITTING_TO_ETHEREUM = 0,
  // transaction hash recieved
  WAITING_FOR_CONFIRMATION = 1,
  // used when the eth transaction is confirmed
  // and we are waiting to reach the confirmation threshold
  CONFIRMING = 2,
  // eth transaction reached the eth confirmation threshold
  CONFIRMED_ON_ETHEREUM = 3,
  // waiting for 'MessageDispatch' event on polkadot for eth transactions
  // or waiting for 'Unlock' event on Ethereum for polkadot transactions
  WAITING_FOR_RELAY = 4,
  // message dispatched on polkadot
  RELAYED = 5,
  // transaction finalized on both chains
  FINALIZED = 6
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
  chain: 'eth' | 'polkadot';
  assets: {
    deposited: 'eth' | 'polkaEth',
    recieved: 'eth' | 'polkaEth',
  }
}

// Interface for the Ethereum 'Unlock' event, emitted by the ETHApp smart contract
export interface EthUnlockEvent extends EventData {
  returnValues: { _amount: string, _recipient: string, _sender: string }
}

// Interface for an PolkaEth 'Burned' event, emitted by the parachain
export interface PolkaEthBurnedEvent {
  accountId: string;
  amount: string;
}

export interface TransactionsState {
  transactions: Transaction[],
  pendingTransaction?: Transaction
}

const initialState: TransactionsState = {
  transactions: [],
  pendingTransaction: undefined
};

function transactionsReducer(state: TransactionsState = initialState, action: any) {
  switch (action.type) {
    case ADD_TRANSACTION: {
      return ((action: AddTransactionPayload) => {
        return Object.assign({}, state, {
          transactions: [...state.transactions, action.transaction],
          pendingTransaction: action.transaction
        });
      })(action)
    }
    case UPDATE_CONFIRMATIONS: {
      return ((action: UpdateConfirmationsPayload) => {
        const getTransactionStatus = (transaction: Transaction): TransactionStatus => {
          // check if the transaction has already been relayed to polkadot
          if (action.confirmations >= REQUIRED_ETH_CONFIRMATIONS) {
            if (transaction.isMinted) {
              return TransactionStatus.RELAYED
            } else {
              return TransactionStatus.CONFIRMED_ON_ETHEREUM
            }
          } else {
            return TransactionStatus.CONFIRMING
          }
        }
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) => t.hash === action.hash
            ? {
              ...t,
              confirmations: action.confirmations,
              status: getTransactionStatus(t)
            }
            : t)
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
    case SET_NONCE: {
      return ((action: SetNoncePayload) => {
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) => t.hash === action.hash ? { ...t, nonce: action.nonce } : t)
        });
      })(action)
    }
    // TODO: Properly map Eth submitted assets to minted assets
    // Called when an PolkaEth asset has been minted by the parachain
    case PARACHAIN_MESSAGE_DISPATCHED: {
      return ((action: ParachainMessageDispatchedPayload) => {
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) =>
            (t.nonce === action.nonce)
              ? {
                ...t,
                isMinted: true,
                status: TransactionStatus.RELAYED
              }
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
              ? { ...t, isBurned: true, status: TransactionStatus.WAITING_FOR_RELAY }
              : t
          )
        });
      })(action)
    }
    case SET_PENDING_TRANSACTION: {
      return ((action: SetPendingTransactionPayload) => {
        return Object.assign({}, state, {
          pendingTransaction: action.transaction
        })
      })(action)
    }
    case ETH_UNLOCKED_EVENT: {
      return ((action: EthUnlockEventPayload) => {
        const isMatchingTransaction = (transaction: Transaction): boolean => {
          return action.transaction.amount === transaction.amount
            && action.transaction.sender === transaction.sender
        }
        return Object.assign({}, state, {
          transactions: state.transactions.map((t) => isMatchingTransaction(t)
            ? {
              ...t,
              status: TransactionStatus.FINALIZED,
              hash: action.event.transactionHash
            }
            : t)
        })
      })(action)
    }
    default:
      return state
  }
}


export default transactionsReducer;
