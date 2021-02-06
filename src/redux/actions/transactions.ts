import {
    ADD_TRANSACTION,
    UPDATE_CONFIRMATIONS,
    SET_NONCE,
    SET_TRANSACTION_STATUS,
    POLKA_ETH_BURNED,
    POLKA_ETH_MINTED,
    SET_PENDING_TRANSACTION,
    ETH_UNLOCKED_EVENT
} from '../actionsTypes/transactions';
import { EthUnlockEvent, PolkaEthBurnedEvent, PolkaEthMintedEvent, Transaction, TransactionStatus } from '../reducers/transactions';

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
})

export interface PolkaEthMintedPayload { type: string, event: PolkaEthMintedEvent };
export const polkaEthMinted = (event: PolkaEthMintedEvent): PolkaEthMintedPayload => ({
    type: POLKA_ETH_MINTED,
    event
})

export interface PolkaEthBurnedPayload { type: string, event: PolkaEthBurnedEvent };
export const polkaEthBurned = (event: PolkaEthBurnedEvent): PolkaEthBurnedPayload => ({
    type: POLKA_ETH_BURNED,
    event
})

export interface SetPendingTransactionPayload { type: string, transaction: Transaction };
export const setPendingTransaction = (transaction: Transaction): SetPendingTransactionPayload => ({
    type: SET_PENDING_TRANSACTION,
    transaction
})

export interface EthUnlockEventPayload { type: string; event: EthUnlockEvent; transaction: Transaction };
export const ethUnlockedEvent = (event: EthUnlockEvent, transaction: Transaction): EthUnlockEventPayload => ({
    type: ETH_UNLOCKED_EVENT,
    event,
    transaction
})
