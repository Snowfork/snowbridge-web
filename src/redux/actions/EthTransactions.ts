/* eslint-disable @typescript-eslint/ban-types */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import Web3 from 'web3';
import { REQUIRED_ETH_CONFIRMATIONS } from '../../config';
import { RootState } from '../reducers';
import { Transaction, TransactionStatus } from '../reducers/transactions';
import { notify } from './notifications';
import {
  setPendingTransaction,
  addTransaction,
  setNonce,
  updateConfirmations,
  createTransaction,
  handlePolkadotTransactionEvents,
} from './transactions';
import EthApi from '../../net/eth';
import Polkadot from '../../net/polkadot';
import { setEthAddress } from './net';
import { Chain, SwapDirection } from '../../types/types';
import { isEther, symbols } from '../../types/Asset';

/**
 * Locks tokens on Ethereum and mints tokens on Polkadot
 * @param {amount} string The amount of tokens (in base units) to lock
 * @return {Promise<void>}
 */
export const lockEthAsset = (
  amount: string,
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
    polkadotAddress,
  } = state.net;
  const {
    swapDirection,
    selectedAsset,
  } = state.bridge;
  const asset = selectedAsset!;

  try {
    const defaultAddress = ethAddress;
    let transactionHash: string;

    if (defaultAddress) {
      if (web3 && ethContract && erc20Contract) {
        const pendingTransaction: Transaction = {
          hash: '',
          confirmations: 0,
          sender: ethAddress!,
          receiver: polkadotAddress!,
          amount,
          status: TransactionStatus.SUBMITTING_TO_CHAIN,
          isMinted: false,
          isBurned: false,
          chain: Chain.ETHEREUM,
          asset,
        };

        const transactionEvent: any = EthApi.lock(
          amount,
          asset,
            ethAddress!,
            polkadotAddress!,
            ethContract,
            erc20Contract,
        );
        console.log('got transaction event', transactionEvent);

        transactionEvent.on('sending', async (payload: any) => {
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
                receiver: polkadotAddress!,
                amount,
                status: TransactionStatus.WAITING_FOR_CONFIRMATION,
                isMinted: false,
                isBurned: false,
                chain: Chain.ETHEREUM,
                asset,
              }),
            );

            dispatch(
              notify(
                {
                  text: `${symbols(asset, swapDirection).from} to ${symbols(asset, swapDirection).to} Transaction created`,
                },
              ),
            );
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
            const logIndex = isEther(asset) ? 0 : 2;
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
              // update transaction confirmations
              dispatch(
                updateConfirmations(receipt.transactionHash, confirmation),
              );

              if (confirmation === REQUIRED_ETH_CONFIRMATIONS) {
                dispatch(notify({
                  text: `Transactions confirmed after ${confirmation} confirmations`,
                  color: 'success',
                }));
                transactionEvent.off('confirmation');
              }
            },
          )
          .on('error', (error: Error) => {
            console.log('error locking tokens', error);
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

// burns asset on polkadot and unlocks on ethereum
export const unlockEthAsset = (amount: string):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    polkadotApi,
    polkadotAddress,
    incentivizedChannelContract,
    ethAddress,
    basicChannelContract,
  } = state.net;
  const {
    selectedAsset,
  } = state.bridge;

  if (polkadotApi) {
    // TODO: ensure account is the selected account
    const account = await Polkadot.getDefaultAddress();

    if (account) {
      const pendingTransaction = createTransaction(
        polkadotAddress!,
        ethAddress!,
        amount,
        Chain.POLKADOT,
        selectedAsset!,
      );
      dispatch(setPendingTransaction(pendingTransaction));

      const unsub = EthApi.unlock(
        amount,
        selectedAsset!,
        account,
        ethAddress!,
        polkadotApi,
        (res: any) => {
          handlePolkadotTransactionEvents(
            res,
            unsub,
            pendingTransaction,
            dispatch,
            incentivizedChannelContract!,
            basicChannelContract!,
          );
        },
      )
        .catch((error: any) => {
          console.log(':( transaction failed', error);
          if (error.toString() === 'Error: Cancelled') {
            dispatch(
              setPendingTransaction({
                ...pendingTransaction,
                status: TransactionStatus.REJECTED,
                error: 'The transaction was cancelled',
              }),
            );
          } else if (error.message.includes('1014: Priority is too low')) {
            dispatch(
              setPendingTransaction({
                ...pendingTransaction,
                status: TransactionStatus.REJECTED,
                error: 'Please wait for the current pending transaction to complete',
              }),
            );
          } else {
            // display error message in modal
            setPendingTransaction({
              ...pendingTransaction,
              status: TransactionStatus.REJECTED,
              error: error.message,
            });
          }
        });
    } else {
      throw new Error('Default Polkadot account not found');
    }
  } else {
    throw new Error('Polkadot API not connected');
  }
};

export const doEthTransfer = (amount: string):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    swapDirection,
  } = state.bridge;
  console.log('doing eth transfer');
  if (swapDirection === SwapDirection.EthereumToPolkadot) {
    dispatch(lockEthAsset(amount));
  } else {
    console.log('unlocking eth');
    dispatch(unlockEthAsset(amount));
  }
};

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
