import {
    ADD_TRANSACTION,
    UPDATE_CONFIRMATIONS,
    SET_TRANSACTION_STATUS
} from '../actionsTypes/transactions';
import { Transaction, TransactionStatus } from '../reducers/transactions';

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

export interface SetTransactionStatusPayload { type: string, hash: string, status: TransactionStatus}
export const setTransactionStatus = (hash: string, status: TransactionStatus): SetTransactionStatusPayload => (
    {
        type: SET_TRANSACTION_STATUS,
        hash,
        status
    }
)