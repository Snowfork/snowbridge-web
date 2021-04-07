import { REQUIRED_ETH_CONFIRMATIONS } from '../config';
import { Transaction } from '../redux/reducers/transactions';

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
