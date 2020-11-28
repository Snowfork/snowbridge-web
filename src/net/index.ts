import Eth from './eth';
import Polkadot from './polkadot';

type StartNet = (n: Net) => void;

export default class Net {
  eth?: Eth;
  ethAddress: string = '';
  polkadot?: Polkadot;
  polkadotAddress: string = '';

  public async start() {
    let eth = new Eth(await Eth.connect(), this);
    let ethAddress = await eth.get_address();
    let polkadot = new Polkadot(await Polkadot.connect(), this);
    let polkadotAddress = await polkadot.get_address();

    if (eth && ethAddress && polkadot && polkadotAddress) {
      this.eth = eth;
      this.ethAddress = ethAddress;
      this.polkadot = polkadot;
      this.polkadotAddress = polkadotAddress;
      console.log('- Network Started');
      console.log(`  Polkadot Address: ${this.polkadotAddress}`);
      console.log(`  Ethereum Address: ${this.ethAddress}`);
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
