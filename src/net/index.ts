import Eth from './eth';
import Polkadot from './polkadot';

import { Dispatch } from 'redux';

import { REQUIRED_ETH_CONFIRMATIONS } from '../config';

export interface Transaction {
  hash: string;
  confirmations: number;
  sender: string;
  receiver: string;
  amount: string;
  chain: 'eth' | 'polkadot';
}

export default class Net {
  eth?: Eth;
  ethAddress: string = '';
  ethBalance?: string;
  polkadot?: Polkadot;
  polkadotAddress: string = '';
  polkadotEthBalance?: string;
  transactions: Array<Transaction> = [];

  constructor() {
    this.pendingTransactions = this.pendingTransactions.bind(this);
    this.updateConfirmations = this.updateConfirmations.bind(this);
  }

  // Adds new transaction to transaction list
  public addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  // Update confirmations of a transaction
  public updateConfirmations(hash: string, confirmations: number): void {
    let transaction = this.transactions.filter((t) => t.hash === hash)[0];

    if (transaction.confirmations !== confirmations) {
      transaction.confirmations = confirmations;
    }
  }

  // returns number of pending (confirming) transactions
  public pendingTransactions(): number {
    return this.transactions.filter(
      (t) => t.confirmations < REQUIRED_ETH_CONFIRMATIONS,
    ).length;
  }

  // Start net
  public async start(dispatch: Dispatch) {
    let eth = new Eth(await Eth.connect(dispatch), this);
    let ethAddress = await eth.get_address();
    let ethBalance = await eth.get_balance();
    let polkadot = new Polkadot(await Polkadot.connect(dispatch), this);
    let polkadotAddresses = await polkadot.get_addresses(dispatch);
    let firstPolkadotAddress =
      polkadotAddresses && polkadotAddresses[0] && polkadotAddresses[0].address;
    let polkadotEthBalance;
    if (firstPolkadotAddress) {
      polkadotEthBalance = await polkadot.get_eth_balance(firstPolkadotAddress);
    }

    if (
      eth &&
      ethAddress &&
      ethBalance &&
      polkadot &&
      firstPolkadotAddress &&
      polkadotEthBalance
    ) {
      this.eth = eth;
      this.ethAddress = ethAddress;
      this.ethBalance = ethBalance;
      this.polkadot = polkadot;
      this.polkadotAddress = firstPolkadotAddress;
      this.polkadotEthBalance = polkadotEthBalance;

      console.log('- Network Started');
      console.log(`  Polkadot Address: ${firstPolkadotAddress}`);
      console.log(`  Ethereum Address: ${this.ethAddress}`);
      console.log(`  Ethereum Balance: ${this.ethBalance}`);
      console.log(`  Polkadot ETH Balance: ${this.polkadotEthBalance}`);
    }
  }
}

export function isConnected(net: Net) {
  if (net && net.eth) {
    return true;
  } else {
    return false;
  }
}
