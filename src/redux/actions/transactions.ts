import {
    ADD_TRANSACTION,
    UPDATE_CONFIRMATIONS,
    SET_TRANSACTION_STATUS,
    POLKA_ETH_BURNED,
    POLKA_ETH_MINTED,
    SET_TRANSACTION_HASH
} from '../actionsTypes/transactions';
import { PolkaEthBurnedEvent, PolkaEthMintedEvent, Transaction, TransactionStatus } from '../reducers/transactions';

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

export interface SetTransactionHashPayload { type: string, nonce: number, hash: string };
export const setTransactionHash = (nonce: number, hash: string): SetTransactionHashPayload => ({
    type: SET_TRANSACTION_HASH,
    nonce,
    hash
})