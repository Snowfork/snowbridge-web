/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import { utils } from 'ethers';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Contract } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import Web3 from 'web3';
import { REQUIRED_ETH_CONFIRMATIONS, CONTRACT_ADDRESS } from '../../config';
import {
  Asset,
  decimals,
  isDot,
  isNonFungible,
  symbols,
} from '../../types/Asset';
import { Chain, SwapDirection, Channel } from '../../types/types';
import { AssetType } from '../../types/Asset';
import { RootState } from '../store';
import {
  MessageDispatchedEvent,
  Transaction,
  TransactionStatus,
  transactionsSlice,
} from '../reducers/transactions';
import { doEthTransfer } from './EthTransactions';
import { doPolkadotTransfer } from './PolkadotTransactions';
import { notify } from './notifications';
import { setShowConfirmTransactionModal, setShowTransactionListModal } from './bridge';
import { updateSelectedAsset } from '../../redux/actions/bridge';
import { subscribeEthereumEvents } from "../../redux/actions/net";
import * as BasicInboundChannel from '../../contracts/BasicInboundChannel.json';
import * as IncentivizedInboundChannel from '../../contracts/IncentivizedInboundChannel.json';
import { ApiPromise } from '@polkadot/api';
import Polkadot from '../../net/polkadot';

export const {
  addTransaction,
  ethMessageDispatched,
  parachainMessageDispatched,
  setConfirmations,
  setNonce,
  setError,
  setPendingTransaction,
  setTransactionStatus,
  updateTransaction,
  updateTransactionNotifyConfirmation
} = transactionsSlice.actions;

export const updateConfirmations = (
  hash: string, confirmations: number,
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
  ): Promise<void> => {
    if (
      confirmations >= REQUIRED_ETH_CONFIRMATIONS
    ) {
      dispatch(setTransactionStatus({ hash, status: TransactionStatus.WAITING_FOR_RELAY }));
    }
    dispatch(setConfirmations({ hash, confirmations }));
  };

export const doTransfer = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    getState,
  ): Promise<void> => {
    const state = getState() as RootState;
    const {
      selectedAsset,
      depositAmount,
      swapDirection,
    } = state.bridge;

    const { from } = decimals(selectedAsset!, swapDirection);
    const fromDecimals = utils.parseUnits(depositAmount, from).toString();
    const amount = fromDecimals;

    // transaction direction logic
    if (!isDot(selectedAsset!)) {
      dispatch(doEthTransfer(amount));
    } else {
      dispatch(doPolkadotTransfer(amount));
    }
  };

// Transaction factory function
export function createTransaction(
  sender: string,
  receiver: string,
  amount: string,
  chain: Chain,
  asset: Asset,
  direction: SwapDirection,
  channel: Channel,
): Transaction {
  const pendingTransaction: Transaction = {
    hash: '',
    confirmations: 0,
    sender,
    receiver,
    amount,
    status: TransactionStatus.SUBMITTING_TO_CHAIN,
    isMinted: false,
    isBurned: false,
    chain,
    asset,
    direction,
    dispatchTransactionHash: '',
    error: '',
    nonce: '',
    channel,
    isNotifyConfirmed: false,
  };

  return pendingTransaction;
}

// This will be used in EthTransactions.unlock and PolkadotTransactions.lock
// This is shared logic that will:
//  be used as a callback for polkadot transaction events
//  update the transaction state
//  wait for the transaction to be finalized and then unsubscribe
//
//  This also subscribes to basicChannelContract events to watch
//  the transaction status on the eth side
export function handlePolkadotTransactionEvents(
  result: any, // event data from polkadot transaction subscription
  unsub: () => void, // function to unsubscribe from polkadot transaction events
  transaction: Transaction, // the transaction we are updating for each event
  dispatch: Dispatch<any>,
  blockNumber: number,
): Transaction {
  const pendingTransaction = { ...transaction };

  if (result.status.isReady) {

    pendingTransaction.nearbyBlockNumber = blockNumber
    pendingTransaction.hash = result.txHash.toString();

    dispatch(
      addTransaction(
        { ...pendingTransaction, status: TransactionStatus.WAITING_FOR_CONFIRMATION },
      ),
    );
    dispatch(setShowConfirmTransactionModal(false));
    dispatch(setShowTransactionListModal(true));
    return pendingTransaction;
  }

  if (result.status.isInBlock) {

    if (result && result.dispatchError)
      return pendingTransaction;
    
    let nonce = result.events[3].event.data[0].toString();

    pendingTransaction.nonce = nonce;
    pendingTransaction.status = TransactionStatus.WAITING_FOR_RELAY;

    dispatch(
      updateTransaction(
        {
          hash: pendingTransaction.hash,
          update: pendingTransaction,
        },
      ),
    );

    dispatch(subscribeEthereumEvents());

    return pendingTransaction;
  }

  if (result.status.isFinalized) {
    console.log({ result })
    console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
    dispatch(
      setTransactionStatus({
        hash: pendingTransaction.hash,
        status: TransactionStatus.WAITING_FOR_RELAY,
      }),
    );
    // unsubscribe from transaction events
    if (unsub) {
      unsub();
    }
  }
  if (result.dispatchError) {
    dispatch(
      setError({
        hash: pendingTransaction.hash,
        error: result.dispatchError
      })
    );
    alert("Error with dispatchable - see polkadotjs explorer for more info: " + result.dispatchError)
  }
  return pendingTransaction;
}

// This will be used in EthTransactions.lock and PolkadotTransactions.unlock
// This contains shared logic to update transaction status given a PromiEvent
export function handleEthereumTransactionEvents(
  transactionEvent: PromiEvent<Contract>,
  pendingTransaction: Transaction,
  dispatch: Dispatch<any>,
  web3: Web3,
): void {
  let transactionHash: string;

  transactionEvent
    .once('sending', async (payload: any) => {
      console.log('Sending Transaction', payload);
      // create transaction with default values to display in the modal
      dispatch(setPendingTransaction(pendingTransaction));
    })
    .once('sent', async (payload: any) => {
      console.log('Transaction sent', payload);
    })
    .on('transactionHash', async (hash: string) => {
      console.log('Transaction hash received', hash);
      dispatch(setShowConfirmTransactionModal(false));
      dispatch(setShowTransactionListModal(true));

      if (pendingTransaction.asset.type === AssetType.ERC721) {
        dispatch(updateSelectedAsset(undefined));
      }

      transactionHash = hash;

      dispatch(
        addTransaction({
          ...pendingTransaction,
          hash,
          confirmations: 0,
          status: TransactionStatus.WAITING_FOR_CONFIRMATION,
        }),
      );

      dispatch(
        notify(
          {
            text: `${symbols(pendingTransaction.asset, pendingTransaction.direction).from
              } to ${symbols(pendingTransaction.asset, pendingTransaction.direction).to
              } Transaction created`,
          },
        ),
      );
    })

    .on('receipt', async (receipt: any) => {
      dispatch(handleTransaction(web3));
    })

    .on(
      'confirmation',
      (
        confirmation: number,
        receipt: any,
      ) => {
        dispatch(handleTransaction(web3));
      },
    )
    .on('error', (error: any) => {
      if (error?.code) {
        dispatch(setPendingTransaction({
          ...pendingTransaction,
          status: TransactionStatus.REJECTED,
          error: error.message,
        }));
      }
      if (error?.receipt) {
        dispatch(
          setError({
            hash: transactionHash,
            error: error.receipt
          }),
        );
      }

      dispatch(notify({
        text: 'Transaction Error',
        color: 'error',
      }));
    });
}

// shared error handling logic for EthTransactions.unlock and PolkadotTransactions.lock
export function handlePolkadotTransactionErrors(
  error: any,
  pendingTransaction: Transaction,
  dispatch: Dispatch<any>,
): void {
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
    dispatch(
      setPendingTransaction({
        ...pendingTransaction,
        status: TransactionStatus.REJECTED,
        error: error.message,
      })
    );
  }
}
//This will be used in handleTransaction to fetch the tx receipt and block confirmation for transaction
export async function handleEthTransaction(
  state: any,
  hash: string,
  web3: Web3,
  dispatch: Dispatch<any>,
  istxConfirmed: any
) {
  //get the transaction receipt
  let txReceipt = await web3.eth.getTransactionReceipt(hash);

  //if pending then return
  if (!txReceipt)
    return '';

  //status-FALSE when EVM reverted the transaction.
  if (!txReceipt.status){
    dispatch(
      setError({
        hash: hash,
        error: 'transaction failed'
      })
    );
    return -1;
  }

  //Fetch current block number
  let currentBlock = await web3.eth.getBlockNumber()
  let confirmation = txReceipt.blockNumber === null ? 0 : currentBlock - txReceipt.blockNumber

  //Should not be called when tx is confirmed
  if (istxConfirmed) {
    handleEthTxRecipt(txReceipt, dispatch, web3)
  }

  if (confirmation > 0 && istxConfirmed)
    handleEthTxConfirmation(state, confirmation, txReceipt, dispatch, web3)
}

//This function is used to obtain and set required nonce from events via use of receipt.
export function handleEthTxRecipt(receipt: any, dispatch: Dispatch<any>,
  web3: Web3) {

  const basicOutChannelLogFields = [
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
  const incentivizedOutChannelLogFields = [
    {
      type: 'address',
      name: 'source',
    },
    {
      type: 'uint64',
      name: 'nonce',
    },
    {
      type: 'uint256',
      name: 'fee',
    },
    {
      type: 'bytes',
      name: 'payload',
    },
  ];
  let nonce;
  (receipt.logs).forEach((log: any) => {
    const event = log;

    if (event.address === CONTRACT_ADDRESS.BasicOutboundChannel) {
      const decodedEvent = web3.eth.abi.decodeLog(
        basicOutChannelLogFields,
        event.data,
        event.topics,
      );
      nonce = decodedEvent.nonce;
    }
    if (event.address === CONTRACT_ADDRESS.IncentivizedOutboundChannel) {
      const decodedEvent = web3.eth.abi.decodeLog(
        incentivizedOutChannelLogFields,
        event.data,
        event.topics,
      );
      nonce = decodedEvent.nonce;
    }
  })
  if (!nonce) {
    return
  }

  dispatch(
    setNonce({
      hash: receipt.transactionHash,
      nonce,
    }),
  );
}

//This will be used in handleEthTransaction for update the eth tx block confirmation for tx.
export function handleEthTxConfirmation(state: any, confirmation: number,
  receipt: any, dispatch: Dispatch<any>,
  web3: Web3) {
  // update transaction confirmations
  dispatch(
    updateConfirmations(receipt.transactionHash, confirmation),
  );

  if (confirmation === REQUIRED_ETH_CONFIRMATIONS) {

    const tranasaction = state.transactions.transactions.filter((transaction: any) => {
      return transaction.hash === receipt.transactionHash
    });

    if (tranasaction.length > 0) {

      if (!tranasaction[0].isNotifyConfirmed) {

        dispatch(updateTransactionNotifyConfirmation({
          hash: tranasaction[0].hash
        }))

        dispatch(notify({
          text: `Transactions confirmed after ${confirmation} confirmations`,
          color: 'success',
        }));

      }
    }
  }
}

//This is used for handling the lost callback of Ethereum and Polkadot transactions
//fetch the tx-receipt, confirmation status, confirmation count,nonce for pending transaction via Hash.
export const handleTransaction = (
  web3: Web3
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    getState,
  ): Promise<void> => {

  const state = getState() as RootState;
  const { polkadotApi } = state.net;

  let pendingEThTransactions = state.transactions.transactions.filter((transaction) => transaction.status != TransactionStatus.WAITING_FOR_RELAY && transaction.direction === SwapDirection.EthereumToPolkadot);
  let pendingPolkaDotTransactions = state.transactions.transactions.filter((transaction) => transaction.status < TransactionStatus.WAITING_FOR_RELAY && transaction.direction === SwapDirection.PolkadotToEthereum);

  if (polkadotApi) {
    if (pendingPolkaDotTransactions.length > 0) {
      pendingPolkaDotTransactions.map((tx: any) => handlepolkadotTransaction(state, tx.hash, tx.nearbyBlockNumber, polkadotApi, dispatch))
    }
  }
  if (pendingEThTransactions.length > 0) {
      pendingEThTransactions.map((tx: any) => handleEthTransaction(state, tx.hash, web3, dispatch, tx.status < TransactionStatus.WAITING_FOR_RELAY ? true : false))  
    }
}

//Handle the missed Polkadot events (MessageDispatch) for the transactions for the basic/Incentivized channel.
//and updates the transaction status accordingly.
export const handlePolkadotMissedEvents = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    getState,
  ): Promise<void> => {
  const state = getState() as RootState;
  const { polkadotApi } = state.net;
  if (polkadotApi) {
    const incentivizeLatestNonce = Number(await polkadotApi.query['incentivizedInboundChannel'].nonce());
    const basicLatestNonce = Number(await polkadotApi.query['basicInboundChannel'].nonce());
    const pendingTransactions = state.transactions.transactions.filter((transaction) => transaction.status >= TransactionStatus.WAITING_FOR_RELAY && transaction.status < TransactionStatus.DISPATCHED && transaction.direction === SwapDirection.EthereumToPolkadot  && Number(transaction.nonce) <= (transaction.channel === Channel.INCENTIVIZED ? incentivizeLatestNonce : basicLatestNonce));

    pendingTransactions.map((tx: Transaction) => {
      const nonce = tx.nonce ? tx.nonce : ''
      const channel = tx.channel === Channel.BASIC ? Channel.BASIC : Channel.INCENTIVIZED

      dispatch(parachainMessageDispatched({ nonce, channel })
      )
    })
  }
}

// Handle the missed event of the inbound channel when user closed the application.
export const handleEthereumMissedEvents = (
  web3: Web3
):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    getState,
  ): Promise<void> => {
    const state = getState() as RootState;

    const incentivizeInboundContract = new web3.eth.Contract(
      IncentivizedInboundChannel.abi as any,
      CONTRACT_ADDRESS.IncentivizedInboundChannel,
    );

    const basicInboundContract = new web3.eth.Contract(
      BasicInboundChannel.abi as any,
      CONTRACT_ADDRESS.BasicInboundChannel,      
    );

    const incentivizeInboundLatestNonce = Number(await incentivizeInboundContract.methods.nonce().call());
    const basicInboundLatestNonce = Number(await basicInboundContract.methods.nonce().call());

    const missedEventTransactions = state.transactions.transactions.filter((transaction) => transaction.status >= TransactionStatus.WAITING_FOR_RELAY && transaction.status < TransactionStatus.DISPATCHED && transaction.direction == SwapDirection.PolkadotToEthereum && Number(transaction.nonce) <= (transaction.channel === Channel.INCENTIVIZED ? incentivizeInboundLatestNonce : basicInboundLatestNonce));

    missedEventTransactions.map((tx: Transaction) => {
      if (tx.nonce) {
        const nonce = tx.nonce
        const channel = tx.channel === Channel.BASIC ? Channel.BASIC : Channel.INCENTIVIZED

        dispatch(ethMessageDispatched({ nonce, channel }))
      }
    })
  }

//This function hanle the lost callback for polkadot transactions and
//contains logic to fetch the transaction confirmation and nonce state.
export async function handlepolkadotTransaction(
  state: any,
  hash: string,
  blockNumber: number,
  polkadotApi: ApiPromise,
  dispatch: Dispatch<any>
) {
  let TxDetail = await Polkadot.getTransactionConfirmation(polkadotApi, hash, blockNumber)
  if (TxDetail.istxFound) {
    dispatch(
      setNonce({
        hash: hash,
        nonce: TxDetail.nonce,
      }),
    );
    dispatch(
      setTransactionStatus({
        hash: hash,
        status: TransactionStatus.WAITING_FOR_RELAY,
      }),
    );
  }
}
