import { BASIC_CHANNEL_ID, INCENTIVIZED_CHANNEL_ID, REQUIRED_ETH_CONFIRMATIONS } from '../config';
import { Transaction,TransactionStatus } from '../redux/reducers/transactions';
import { SwapDirection, Chain, Channel } from '../types/types';
import { isNonFungible, NonFungibleToken, Asset } from '../types/Asset';
import {  PayloadAction } from '@reduxjs/toolkit';

/**
 * Shortens a wallet address, showing X number of letters, an ellipsis, and
 *  then Y number of letters
 * @param {string} str The wallet address as a string
 * @param {number} [prefix=6] The letters shown at the start before the ellipsis
 * @param {number} [suffix=4] The letters shown at the end after the ellipsis
 * @return {string} A string with a prefix, ellipsis and then suffix
 * @example
 *
 *
 * shortenWalletAddress('0xda4F4d0123456789a4D771111b36512345DcB10C')
 * // returns "0xda4F...B10C"
 */
export function shortenWalletAddress(str: string, prefix = 6, suffix = 4)
  : string {
  return `${str.slice(0, prefix)}...${str.slice(
    str.length - suffix,
    str.length,
  )}`;
}

/**
 *
 * Formats a value to decimal with X number of spaces, typically used for
 * displaying currency
 *
 * @param {number} value The value that is going to be displayed
 * @param {number} [decimalPlaces=2] The number of decimal spaces to use
 * @returns {string} The formatted number
 * @example
 *
 * formatToDecimalString(20, 2)
 * // returns "20.00"
 *
 */
export function formatToDecimalString(
  value: number | string,
  decimalPlaces = 2,
): string {
  return Number(
    `${Math.round(parseFloat(`${value}e${decimalPlaces}`))}e-${decimalPlaces}`,
  ).toFixed(decimalPlaces);
}

/**
 *
 * Returns number of pending (confirming) transactions
 *
 * @param {Transaction[]} transactions The list of transactions to check
 * @returns {number} The number of pending transactions

 */
export const pendingTransactions = (transactions: Transaction[])
  : number => transactions.filter(
    (t) => t.confirmations < REQUIRED_ETH_CONFIRMATIONS,
  ).length;

export const pendingEventTransactions = (transactions: Transaction[])
  : number => transactions.filter(
    (t) => t.status !== TransactionStatus.DISPATCHED && t.status !== TransactionStatus.REJECTED,
  ).length;

export const getChainsFromDirection = (swapDirection: SwapDirection): { from: Chain, to: Chain } => (
  swapDirection === SwapDirection.EthereumToPolkadot
    ? { from: Chain.ETHEREUM, to: Chain.POLKADOT }
    : { from: Chain.POLKADOT, to: Chain.ETHEREUM }
);

export const getChainName = (chain: Chain): string => {
  switch (chain) {
    case Chain.ETHEREUM:
      return 'Ethereum';
    case Chain.POLKADOT:
      return 'Polkadot';
  }
};

export const getChainImage = (chain: Chain): string => {
  switch (chain) {
    case Chain.ETHEREUM:
      return '/images/logos/ethereum.svg';
    case Chain.POLKADOT:
      return '/images/logos/polkadot.svg';
  }
};

export const assetToString = (asset: Asset, amount?: string): string => {
  return isNonFungible(asset) ?
    `${asset.name} [${(asset.token as NonFungibleToken).ethId}]` :
    `${amount} ${asset.name}`
};

export const getChannelID = (channel: Channel): number => {
  switch (channel) {
    case Channel.BASIC:
      return BASIC_CHANNEL_ID;
    case Channel.INCENTIVIZED:
      return INCENTIVIZED_CHANNEL_ID;
  }
}

//Remove property named as pipes causing circular JSON issue in redux persist
export const nonCircularPayload = (action: PayloadAction<Transaction>): Transaction => {
  action.payload = JSON.parse(JSON.stringify(action.payload,(key,value) => {
    return key === 'pipes' ? null : value;
  }))
  return action.payload;
}

//Remove property named as pipes causing circular JSON issue in redux persist for the case of update transaction
export const nonCircularUpdateTxPayload = (update: Partial<Transaction>): any => {
  update = JSON.parse(JSON.stringify(update,(key,value) => {
    return key === 'pipes' ? null : value;
  }))
  return update;
}
