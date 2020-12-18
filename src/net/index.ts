import Eth from './eth';
import Polkadot from './polkadot';

import { Dispatch } from 'redux';

export interface Transaction {
  hash: string;
  status: 'confirming' | 'success';
  confirmations: number;
  variant: 'eth' | 'polkadot';
}

export default class Net {
  eth?: Eth;
  ethAddress: string = '';
  ethBalance?: string;
  polkadot?: Polkadot;
  polkadotAddress: string = '';
  polkadotBalance?: string;
  transactions: Array<Transaction> = [];

  constructor() {
    this.emptyTransactions = this.emptyTransactions.bind(this);
    this.pendingTransactions = this.pendingTransactions.bind(this);
    this.updateTransactionStatus = this.updateTransactionStatus.bind(this);
    this.updateConfirmations = this.updateConfirmations.bind(this);
  }

  // Adds new transaction to transaction list
  public addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  // Changes the status of a transaction
  public updateTransactionStatus(
    hash: string,
    status: 'confirming' | 'success',
  ): void {
    let transaction = this.transactions.filter((t) => t.hash === hash)[0];

    if (transaction.status !== status) {
      transaction.status = status;
    }
  }

  // Update confirmations of a transaction
  public updateConfirmations(hash: string, confirmations: number): void {
    let transaction = this.transactions.filter((t) => t.hash === hash)[0];

    if (transaction.confirmations !== confirmations) {
      transaction.confirmations = confirmations;
    }
  }

  // Empty transactions list
  public emptyTransactions(): void {
    this.transactions = [];
  }

  // returns number of pending (confirming) transactions
  public pendingTransactions(): number {
    return this.transactions.filter((t) => t.status === 'confirming').length;
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
    let polkadotBalance;
    if (firstPolkadotAddress) {
      polkadotBalance = await polkadot.get_balance(firstPolkadotAddress);
    }

    if (
      eth &&
      ethAddress &&
      ethBalance &&
      polkadot &&
      firstPolkadotAddress &&
      polkadotBalance
    ) {
      this.eth = eth;
      this.ethAddress = ethAddress;
      this.ethBalance = ethBalance;
      this.polkadot = polkadot;
      this.polkadotAddress = firstPolkadotAddress;
      this.polkadotBalance = polkadotBalance;

      console.log('- Network Started');
      console.log(`  Polkadot Address: ${firstPolkadotAddress}`);
      console.log(`  Ethereum Address: ${this.ethAddress}`);
      console.log(`  Ethereum Balance: ${this.ethBalance}`);
      console.log(`  Polkadot Balance: ${this.polkadotBalance}`);
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
