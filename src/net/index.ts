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
  parachainTokenBalance?: string;

  // Start net
  public async start(dispatch: Dispatch) {
    let eth = new Eth(await Eth.connect(dispatch), this, dispatch);
    let ethAddress = await eth.get_address();
    let ethBalance = await eth.get_balance();
    let polkadot = new Polkadot(await Polkadot.connect(dispatch), this, dispatch);
    let polkadotAddresses = await polkadot.get_addresses();
    let firstPolkadotAddress =
      polkadotAddresses && polkadotAddresses[0] && polkadotAddresses[0].address;


    if (
      eth &&
      ethAddress &&
      ethBalance &&
      polkadot &&
      firstPolkadotAddress
    ) {
      this.eth = eth;
      this.ethAddress = ethAddress;
      this.ethBalance = ethBalance;
      this.polkadot = polkadot;
      await this.set_selected_polkadot_address(firstPolkadotAddress)

      console.log('- Network Started');
      console.log(`  Polkadot Address: ${firstPolkadotAddress}`);
      console.log(`  Ethereum Address: ${this.ethAddress}`);
      console.log(`  Ethereum Balance: ${this.ethBalance}`);
      console.log(`  Polkadot ETH Balance: ${this.polkadotEthBalance}`);
    }
  }

  // update selected polkadot address
  public async set_selected_polkadot_address(address: string) {
    // update selected address
    this.polkadotAddress = address;
    // fetch parachain token balance
    this.parachainTokenBalance = await this.polkadot?.get_gas_currency_balance(address);
    // fetch snowEth balance
    this.polkadotEthBalance = await this.polkadot?.get_eth_balance(address) as string;
  }

}

export function isConnected(net: Net) {
  if (net && net.eth) {
    return true;
  } else {
    return false;
  }
}
