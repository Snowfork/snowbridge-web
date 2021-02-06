import {
    ADD_TRANSACTION,
    UPDATE_CONFIRMATIONS,
    SET_NONCE,
    SET_TRANSACTION_STATUS,
    POLKA_ETH_BURNED,
    SET_PENDING_TRANSACTION,
    ETH_MESSAGE_DELIVERED_EVENT,
    PARACHAIN_MESSAGE_DISPATCHED
} from '../actionsTypes/transactions';
import { PolkaEthBurnedEvent, Transaction, TransactionStatus } from '../reducers/transactions';

export interface AddTransactionPayload { type: string, transaction: Transaction };
export const addTransaction = (transaction: Transaction): AddTransactionPayload => ({
    type: ADD_TRANSACTION,
    transaction
});

export interface UpdateConfirmationsPayload { type: string, hash: string, confirmations: number };
export const updateConfirmations = (hash: string, confirmations: number): UpdateConfirmationsPayload => ({
    type: UPDATE_CONFIRMATIONS,
    hash,
    confirmations
});

export interface SetNoncePayload { type: string, hash: string, nonce: string };
export const setNonce = (hash: string, nonce: string): SetNoncePayload => ({
    type: SET_NONCE,
    hash,
    nonce
});

export interface SetTransactionStatusPayload { type: string, hash: string, status: TransactionStatus }
export const setTransactionStatus = (hash: string, status: TransactionStatus): SetTransactionStatusPayload => ({
    type: SET_TRANSACTION_STATUS,
    hash,
    status
});

export interface ParachainMessageDispatchedPayload { type: string, nonce: string };
export const parachainMessageDispatched = (nonce: string): ParachainMessageDispatchedPayload => ({
    type: PARACHAIN_MESSAGE_DISPATCHED,
    nonce
});

export interface EthMessageDeliveredPayload { type: string, nonce: string, deliveryTransactionHash: string };
export const ethMessageDelivered = (nonce: string, deliveryTransactionHash: string): EthMessageDeliveredPayload => ({
    type: ETH_MESSAGE_DELIVERED_EVENT,
    nonce,
    deliveryTransactionHash
});

export interface PolkaEthBurnedPayload { type: string, event: PolkaEthBurnedEvent };
export const polkaEthBurned = (event: PolkaEthBurnedEvent): PolkaEthBurnedPayload => ({
    type: POLKA_ETH_BURNED,
    event
});

export interface SetPendingTransactionPayload { type: string, transaction: Transaction };
export const setPendingTransaction = (transaction: Transaction): SetPendingTransactionPayload => ({
    type: SET_PENDING_TRANSACTION,
    transaction
});
