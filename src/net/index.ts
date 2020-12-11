import Eth from './eth';
import Polkadot from './polkadot';

import { Dispatch } from 'redux';

export default class Net {
  eth?: Eth;
  ethAddress: string = '';
  ethBalance?: string;
  polkadot?: Polkadot;
  polkadotAddress: string = '';
  polkadotBalance?: string;

  public async start(dispatch: Dispatch) {
    let eth = new Eth(await Eth.connect(dispatch), this);
    let ethAddress = await eth.get_address();
    let ethBalance = await eth.get_balance();
    let polkadot = new Polkadot(await Polkadot.connect(dispatch), this);
    let polkadotAddresses = await polkadot.get_addresses(dispatch);
    let firstPolkadotAddress = polkadotAddresses && polkadotAddresses[0] && polkadotAddresses[0].address;
    let polkadotBalance;
    if(firstPolkadotAddress) {
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
