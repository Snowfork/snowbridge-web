import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Token } from '../../types';
import {
    ADD_TRANSACTION,
    UPDATE_CONFIRMATIONS,
    SET_NONCE,
    SET_TRANSACTION_STATUS,
    POLKA_ETH_BURNED,
    SET_PENDING_TRANSACTION,
    PARACHAIN_MESSAGE_DISPATCHED,
    ETH_MESSAGE_DISPATCHED_EVENT,
    UPDATE_TRANSACTION,
    SET_ETH_ADDRESS,
    SET_ETH_BALANCE
} from '../actionsTypes/transactions';
import { PolkaEthBurnedEvent, Transaction, TransactionStatus } from '../reducers/transactions';
import * as EthApi from '../../utils/EthApi'
import Web3 from 'web3';
import { notify } from './notifications';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { ss58_to_u8 } from '../../net/api';
import * as ERC20Api from '../../utils/ERC20Api';
import { RootState } from '../reducers';

// TODO: move to config?
const INCENTIVIZED_CHANNEL_ID = 1;

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

export interface UpdateTransactionPayload { type: string, hash: string, updates: any }
export const updateTransaction = (hash: string, updates: any): UpdateTransactionPayload => ({
    type: UPDATE_TRANSACTION,
    hash,
    updates
});

export interface ParachainMessageDispatchedPayload { type: string, nonce: string };
export const parachainMessageDispatched = (nonce: string): ParachainMessageDispatchedPayload => ({
    type: PARACHAIN_MESSAGE_DISPATCHED,
    nonce
});

export interface EthMessageDispatchedPayload { type: string, nonce: string, dispatchTransactionHash: string };
export const ethMessageDispatched = (nonce: string, dispatchTransactionHash: string): EthMessageDispatchedPayload => ({
    type: ETH_MESSAGE_DISPATCHED_EVENT,
    nonce,
    dispatchTransactionHash
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

export interface SetEthAddressPayload { type: string, address: string };
export const setEthAddress = (address: string) => ({
    type: SET_ETH_ADDRESS,
    address
})

export interface SetEthBalancePayload { type: string, balance: string };
export const setEthBalance = (balance: string) => ({
    type: SET_ETH_BALANCE,
    balance
})

// async thunk actions
export const fetchEthAddress = ():
    ThunkAction<Promise<void>, {}, {}, AnyAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState): Promise<void> => {
        const state = getState() as RootState;
        const web3: Web3 = state.net.web3!;

        const address = await EthApi.getAddress(web3);
        dispatch(setEthAddress(address))
    }
}

export const fetchEthBalance = ():
    ThunkAction<Promise<void>, {}, {}, AnyAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState): Promise<void> => {
        const state = getState() as RootState;
        const web3: Web3 = state.net.web3!;

        const balance = await EthApi.getBalance(web3);
        dispatch(setEthBalance(balance))
    }
}

export const lockToken = (
    amount: string,
    token: Token,
    _polkadotAddress: string
):
    ThunkAction<Promise<void>, {}, {}, AnyAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState): Promise<void> => {
        const state = getState() as RootState;
        const ethAddress = state.transactions.ethAddress as string;
        const ethContract = state.net.ethContract!;
        const erc20Contract = state.net.erc20Contract!;
        const web3 = state.net.web3!;

        try {
            let default_address = ethAddress;
            let transactionHash: string;

            if (default_address) {
                if (web3 && ethContract && erc20Contract) {
                    const polkadotAddress: Uint8Array = ss58_to_u8(
                        _polkadotAddress,
                    );

                    const pendingTransaction: Transaction = {
                        hash: '',
                        confirmations: 0,
                        sender: ethAddress,
                        receiver: _polkadotAddress,
                        amount: amount,
                        status: TransactionStatus.SUBMITTING_TO_CHAIN,
                        isMinted: false,
                        isBurned: false,
                        chain: 'eth',
                        token
                    }

                    let promiEvent: any;
                    if (token.address === '0x0') {
                        promiEvent = ethContract.methods
                            .lock(polkadotAddress, INCENTIVIZED_CHANNEL_ID)
                            .send({
                                from: default_address,
                                gas: 500000,
                                value: web3.utils.toWei(amount, 'ether'),
                            });
                    } else {
                        const tokenAmountWithDecimals = await ERC20Api.addDecimals(token, amount);
                        promiEvent = erc20Contract.methods
                            .lock(token.address, polkadotAddress, tokenAmountWithDecimals, INCENTIVIZED_CHANNEL_ID)
                            .send({
                                from: default_address,
                                gas: 500000,
                                value: 0
                            });
                    }

                    promiEvent.on('sending', async function (payload: any) {
                        console.log('Sending Transaction', payload);
                        // create transaction with default values to display in the modal
                        dispatch(setPendingTransaction(pendingTransaction));
                    })
                        .on('sent', async function (payload: any) {
                            console.log('Transaction sent', payload);
                        })
                        .on('transactionHash', async function (hash: string) {
                            console.log('Transaction hash received', hash);
                            transactionHash = hash;

                            dispatch(
                                addTransaction({
                                    hash,
                                    confirmations: 0,
                                    sender: ethAddress,
                                    receiver: _polkadotAddress,
                                    amount: amount,
                                    status: TransactionStatus.WAITING_FOR_CONFIRMATION,
                                    isMinted: false,
                                    isBurned: false,
                                    chain: 'eth',
                                    token
                                }),
                            );

                            dispatch(notify({ text: `${token.symbol} to Snow${token.symbol} Transaction created` }));
                        })
                        .on('receipt', async function (receipt: any) {
                            console.log('Transaction receipt received', receipt);
                            const outChannelLogFields = [
                                {
                                    type: 'address',
                                    name: 'source'
                                },
                                {
                                    type: 'uint64',
                                    name: 'nonce'
                                },
                                {
                                    type: 'bytes',
                                    name: 'payload',
                                }
                            ];
                            const logIndex = token.address === '0x0' ? 0 : 2;
                            const channelEvent = receipt.events[logIndex];
                            const decodedEvent = web3.eth.abi.decodeLog(outChannelLogFields, channelEvent.raw.data, channelEvent.raw.topics);
                            const nonce = decodedEvent.nonce;
                            dispatch(
                                setNonce(transactionHash, nonce),
                            );
                        })
                        .on(
                            'confirmation',
                            function (
                                confirmation: number,
                                receipt: any,
                            ) {
                                console.log(`Got confirmation ${confirmation} for ${receipt.transactionHash}`);
                                // update transaction confirmations
                                dispatch(
                                    updateConfirmations(receipt.transactionHash, confirmation),
                                );

                                if (confirmation === REQUIRED_ETH_CONFIRMATIONS) {
                                    dispatch(notify({
                                        text: `Transactions confirmed after ${confirmation} confirmations`,
                                        color: 'success'
                                    }));
                                    promiEvent.off('confirmation');
                                }
                            },
                        )
                        .on('error', function (error: Error) {
                            // TODO: render error message
                            dispatch(setPendingTransaction({
                                ...pendingTransaction,
                                status: TransactionStatus.REJECTED,
                            }));

                            dispatch(notify({
                                text: `Transaction Error`,
                                color: 'error'
                            }));
                            throw error;
                        });
                }
            } else {
                throw new Error('Default Address not found');
            }
        } catch (err) {
            //Todo: Error Sending Ethereum
            console.log(err);
        }


    }
}