import { SwapDirection, Transaction } from 'asset-transfer-sdk/lib/types';
import { REQUIRED_ETH_CONFIRMATIONS } from '../config';
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
 * Returns number of pending (confirming) transactions
 *
 * @param {Transaction[]} transactions The list of transactions to check
 * @returns {number} The number of pending transactions

 */
export const pendingTransactions = (transactions: Transaction[])
  : number => transactions.filter(
  (t) => t.confirmations < REQUIRED_ETH_CONFIRMATIONS,
).length;

export const getNetworkNames = (swapDirection: SwapDirection): {from: string, to: string} => (
  swapDirection === SwapDirection.EthereumToPolkadot
    ? { from: 'Ethereum', to: 'Polkadot' }
    : { from: 'Polkadot', to: 'Ethereum' }
);
