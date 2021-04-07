/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import { web3FromSource } from '@polkadot/extension-dapp';
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
  SET_ETH_BALANCE,
  SET_POLKAETH_BALANCE,
  SET_POLKADOT_GAS_BALANCE,
} from '../actionsTypes/transactions';
import {
  MessageDispatchedEvent, PolkaEthBurnedEvent, Transaction, TransactionStatus,
} from '../reducers/transactions';
import EthApi from '../../net/eth';
import { notify } from './notifications';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { ss58ToU8 } from '../../net/api';
import * as ERC20Api from '../../utils/ERC20Api';
import { RootState } from '../reducers';
import Polkadot from '../../net/polkadot';
import { setEthAddress } from './net';

// TODO: move to config?
const INCENTIVIZED_CHANNEL_ID = 1;

export interface AddTransactionPayload { type: string, transaction: Transaction }
export const addTransaction = (transaction: Transaction): AddTransactionPayload => ({
  type: ADD_TRANSACTION,
  transaction,
});

export interface UpdateConfirmationsPayload { type: string, hash: string, confirmations: number }
export const updateConfirmations = (hash: string, confirmations: number)
  : UpdateConfirmationsPayload => ({
  type: UPDATE_CONFIRMATIONS,
  hash,
  confirmations,
});

export interface SetNoncePayload { type: string, hash: string, nonce: string }
export const setNonce = (hash: string, nonce: string): SetNoncePayload => ({
  type: SET_NONCE,
  hash,
  nonce,
});

export interface SetTransactionStatusPayload {
  type: string,
  hash: string,
  status: TransactionStatus
}
export const setTransactionStatus = (hash: string, status: TransactionStatus)
  : SetTransactionStatusPayload => ({
  type: SET_TRANSACTION_STATUS,
  hash,
  status,
});

export interface UpdateTransactionPayload { type: string, hash: string, updates: any }
export const updateTransaction = (hash: string, updates: any): UpdateTransactionPayload => ({
  type: UPDATE_TRANSACTION,
  hash,
  updates,
});

export interface ParachainMessageDispatchedPayload { type: string, nonce: string }
export const parachainMessageDispatched = (nonce: string): ParachainMessageDispatchedPayload => ({
  type: PARACHAIN_MESSAGE_DISPATCHED,
  nonce,
});

export interface EthMessageDispatchedPayload {
  type: string,
  nonce: string,
  dispatchTransactionHash: string
}
export const ethMessageDispatched = (nonce: string, dispatchTransactionHash: string)
  : EthMessageDispatchedPayload => ({
  type: ETH_MESSAGE_DISPATCHED_EVENT,
  nonce,
  dispatchTransactionHash,
});

export interface PolkaEthBurnedPayload { type: string, event: PolkaEthBurnedEvent }
export const polkaEthBurned = (event: PolkaEthBurnedEvent): PolkaEthBurnedPayload => ({
  type: POLKA_ETH_BURNED,
  event,
});

export interface SetPendingTransactionPayload { type: string, transaction: Transaction }
export const setPendingTransaction = (transaction: Transaction): SetPendingTransactionPayload => ({
  type: SET_PENDING_TRANSACTION,
  transaction,
});

export interface SetEthBalancePayload { type: string, balance: string }
export const setEthBalance = (balance: string): SetEthBalancePayload => ({
  type: SET_ETH_BALANCE,
  balance,
});

// async thunk actions
//
// Eth transactions
//
export const fetchEthAddress = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const web3: Web3 = state.net.web3!;

  const address = await EthApi.getAddress(web3);
  dispatch(setEthAddress(address));
};

export const fetchEthBalance = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const web3: Web3 = state.net.web3!;

  const balance = await EthApi.getBalance(web3);
  dispatch(setEthBalance(balance));
};

export const lockToken = (
  amount: string,
  token: Token,
  _polkadotAddress: string,
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    ethContract,
    erc20Contract,
    web3,
    ethAddress,
  } = state.net;

  try {
    const defaultAddress = ethAddress;
    let transactionHash: string;

    if (defaultAddress) {
      if (web3 && ethContract && erc20Contract) {
        const polkadotAddress: Uint8Array = ss58ToU8(
          _polkadotAddress,
        );

        const pendingTransaction: Transaction = {
          hash: '',
          confirmations: 0,
          sender: ethAddress!,
          receiver: _polkadotAddress,
          amount,
          status: TransactionStatus.SUBMITTING_TO_CHAIN,
          isMinted: false,
          isBurned: false,
          chain: 'eth',
          token,
        };

        let promiEvent: any;
        if (token.address === '0x0') {
          promiEvent = ethContract.methods
            .lock(polkadotAddress, INCENTIVIZED_CHANNEL_ID)
            .send({
              from: defaultAddress,
              gas: 500000,
              value: web3.utils.toWei(amount, 'ether'),
            });
        } else {
          const tokenAmountWithDecimals = await ERC20Api.addDecimals(token, amount);
          promiEvent = erc20Contract.methods
            .lock(token.address, polkadotAddress, tokenAmountWithDecimals, INCENTIVIZED_CHANNEL_ID)
            .send({
              from: defaultAddress,
              gas: 500000,
              value: 0,
            });
        }

        promiEvent.on('sending', async (payload: any) => {
          console.log('Sending Transaction', payload);
          // create transaction with default values to display in the modal
          dispatch(setPendingTransaction(pendingTransaction));
        })
          .on('sent', async (payload: any) => {
            console.log('Transaction sent', payload);
          })
          .on('transactionHash', async (hash: string) => {
            console.log('Transaction hash received', hash);
            transactionHash = hash;

            dispatch(
              addTransaction({
                hash,
                confirmations: 0,
                sender: ethAddress!,
                receiver: _polkadotAddress,
                amount,
                status: TransactionStatus.WAITING_FOR_CONFIRMATION,
                isMinted: false,
                isBurned: false,
                chain: 'eth',
                token,
              }),
            );

            dispatch(notify({ text: `${token.symbol} to Snow${token.symbol} Transaction created` }));
          })
          .on('receipt', async (receipt: any) => {
            console.log('Transaction receipt received', receipt);
            const outChannelLogFields = [
              {
                type: 'address',
                name: 'source',
              },
              {
                type: 'uint64',
                name: 'nonce',
              },
              {
                type: 'bytes',
                name: 'payload',
              },
            ];
            const logIndex = token.address === '0x0' ? 0 : 2;
            const channelEvent = receipt.events[logIndex];
            const decodedEvent = web3.eth.abi.decodeLog(
              outChannelLogFields,
              channelEvent.raw.data,
              channelEvent.raw.topics,
            );
            const { nonce } = decodedEvent;
            dispatch(
              setNonce(transactionHash, nonce),
            );
          })
          .on(
            'confirmation',
            (
              confirmation: number,
              receipt: any,
            ) => {
              console.log(`Got confirmation ${confirmation} for ${receipt.transactionHash}`);
              // update transaction confirmations
              dispatch(
                updateConfirmations(receipt.transactionHash, confirmation),
              );

              if (confirmation === REQUIRED_ETH_CONFIRMATIONS) {
                dispatch(notify({
                  text: `Transactions confirmed after ${confirmation} confirmations`,
                  color: 'success',
                }));
                promiEvent.off('confirmation');
              }
            },
          )
          .on('error', (error: Error) => {
            // TODO: render error message
            dispatch(setPendingTransaction({
              ...pendingTransaction,
              status: TransactionStatus.REJECTED,
            }));

            dispatch(notify({
              text: 'Transaction Error',
              color: 'error',
            }));
            throw error;
          });
      }
    } else {
      throw new Error('Default Address not found');
    }
  } catch (err) {
    // Todo: Error Sending Ethereum
    console.log(err);
  }
};

//
// Polkadot transactions
//

export interface SetPolkadotEthBalancePayload { type: string, balance: string }
export const setPolkadotEthBalance = (balance: string): SetPolkadotEthBalancePayload => ({
  type: SET_POLKAETH_BALANCE,
  balance,
});

export interface SetPolkadotGasBalancePayload { type: string, balance: string }
export const setPolkadotGasBalance = (balance: string): SetPolkadotGasBalancePayload => ({
  type: SET_POLKADOT_GAS_BALANCE,
  balance,
});

export const fetchPolkadotEthBalance = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { polkadotApi, polkadotAddress, ethAssetId } = state.net;
  if (polkadotApi) {
    const balance = await Polkadot.getEthBalance(polkadotApi, polkadotAddress, ethAssetId);
    dispatch(setPolkadotEthBalance(balance));
  } else {
    throw new Error('Unable to fetch polkadot eth balance');
  }
};

export const fetchPolkadotGasBalance = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { polkadotApi, polkadotAddress } = state.net;

  if (polkadotApi && polkadotAddress) {
    const balance = await Polkadot.getGasCurrencyBalance(polkadotApi, polkadotAddress);
    dispatch(setPolkadotGasBalance(balance));
  } else {
    throw new Error('Unable to fetch polkadot balance');
  }
};

// burns token on polkadot and unlocks on ethereum

export const burnToken = (amount: string, token: Token, recepientEthAddress: string):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    web3, polkadotApi, polkadotAddress, incentivizedChannelContract,
  } = state.net;

  if (polkadotApi) {
    const account = await Polkadot.getDefaultAddress();
    const recepient = recepientEthAddress;

    if (account) {
      const pendingTransaction: Transaction = {
        hash: '',
        confirmations: 0,
        sender: polkadotAddress!,
        receiver: recepientEthAddress,
        amount,
        status: TransactionStatus.SUBMITTING_TO_CHAIN,
        isMinted: false,
        isBurned: false,
        chain: 'polkadot',
        token,
      };
      dispatch(setPendingTransaction(pendingTransaction));

      const polkaWeiValue = web3!.utils.toWei(amount, 'ether');

      let burnExtrinsic;
      if (token.address === '0x0') {
        burnExtrinsic = polkadotApi.tx.eth.burn(
          INCENTIVIZED_CHANNEL_ID,
          recepient,
          polkaWeiValue,
        );
      } else {
        burnExtrinsic = polkadotApi.tx.erc20.burn(
          INCENTIVIZED_CHANNEL_ID,
          token.address,
          recepient,
          polkaWeiValue,
        );
      }

      // to be able to retrieve the signer interface from this account
      // we can use web3FromSource which will return an InjectedExtension type
      const injector = await web3FromSource(account.meta.source);

      // passing the injected account address as the first argument of signAndSend
      // will allow the api to retrieve the signer and the user will see the extension
      // popup asking to sign the balance transfer transaction
      burnExtrinsic
        .signAndSend(
          account.address,
          { signer: injector.signer },
          (result) => {
            if (result.status.isReady) {
              pendingTransaction.hash = result.status.hash.toString();
              dispatch(
                addTransaction(
                  { ...pendingTransaction, status: TransactionStatus.WAITING_FOR_CONFIRMATION },
                ),
              );
            }
            if (result.status.isInBlock) {
              const nonce = result.events[0].event.data[1].toString();
              dispatch(
                updateTransaction(
                  pendingTransaction.hash, { nonce, status: TransactionStatus.FINALIZED_ON_CHAIN },
                ),
              );
              // subscribe to ETH dispatch event
              incentivizedChannelContract?.events.MessageDispatched({})
                .on('data', (
                  event: MessageDispatchedEvent,
                ) => {
                  if (
                    event.returnValues.nonce === nonce
                  ) {
                    dispatch(
                      ethMessageDispatched(event.returnValues.nonce, pendingTransaction.nonce!),
                    );
                  }
                });
            } else if (result.status.isFinalized) {
              dispatch(
                setTransactionStatus(pendingTransaction.hash, TransactionStatus.FINALIZED_ON_CHAIN),
              );
            }
          },
        )
        .catch((error: any) => {
          console.log(':( transaction failed', error);
          if (error.toString() === 'Error: Cancelled') {
            dispatch(
              setPendingTransaction({ ...pendingTransaction, status: TransactionStatus.REJECTED }),
            );
          } else {
            // TODO: display error in modal
          }
        });
    } else {
      throw new Error('Default Polkadot account not found');
    }
  } else {
    throw new Error('Polkadot API not connected');
  }
};
