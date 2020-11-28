import Eth from './eth';
import Polkadot from './polkadot';

type StartNet = (n: Net) => void;

export default class Net {
  eth?: Eth;
  ethAddress: string = '';
  ethBalance?: string;
  polkadot?: Polkadot;
  polkadotAddress: string = '';
  polkadotBalance?: string;

  public async start() {
    let eth = new Eth(await Eth.connect(), this);
    let ethAddress = await eth.get_address();
    let ethBalance = await eth.get_balance();
    let polkadot = new Polkadot(await Polkadot.connect(), this);
    let polkadotAddress = await polkadot.get_address();
    let polkadotBalance = await polkadot.get_balance();

    if (
      eth &&
      ethAddress &&
      ethBalance &&
      polkadot &&
      polkadotAddress &&
      polkadotBalance
    ) {
      this.eth = eth;
      this.ethAddress = ethAddress;
      this.ethBalance = ethBalance;
      this.polkadot = polkadot;
      this.polkadotAddress = polkadotAddress;
      this.polkadotBalance = polkadotBalance;

      console.log('- Network Started');
      console.log(`  Polkadot Address: ${this.polkadotAddress}`);
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
