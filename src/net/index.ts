import Eth from './eth';
import Polkadot from './polkadot';

import { Dispatch } from 'redux';

export interface Transaction {
  hash: string;
  state: 'confirming' | 'success';
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
    this.empty_transactions = this.empty_transactions.bind(this);
  }

  public add_transaction(transaction: Transaction) {
    this.transactions.push(transaction);
  }

  public update_transaction_state(
    hash: string,
    state: 'confirming' | 'success',
  ) {
    let transaction = this.transactions.filter((t) => t.hash === hash)[0];

    if (transaction.state !== state) {
      transaction.state = state;
    }
  }

  public empty_transactions() {
    this.transactions = [];
  }

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
