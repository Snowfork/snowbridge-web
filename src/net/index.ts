import Eth from './eth';
import Polkadot from './polkadot';
import { Dispatch } from 'redux';

export default class Net {
  eth?: Eth;
  ethAddress: string = '';
  ethBalance?: string;
  polkadot?: Polkadot;
  polkadotAddress: string = '';
  polkadotEthBalance?: string;

  // Start net
  public async start(dispatch: Dispatch) {
    let eth = new Eth(await Eth.connect(dispatch), this, dispatch);
    let ethAddress = await eth.get_address();
    let ethBalance = await eth.get_balance();
    let polkadot = new Polkadot(await Polkadot.connect(dispatch), this, dispatch);
    let polkadotAddresses = await polkadot.get_addresses();
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
