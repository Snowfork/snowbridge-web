import { Dispatch } from 'redux';
import { AssetTransferSdk } from 'asset-transfer-sdk';
import Eth from './eth';
import Polkadot from './polkadot';
import { setNetworkConnected, setSdk } from '../redux/actions/net';

export default class Net {
  // Start net
  public static async start(dispatch: Dispatch): Promise<void> {
    try {
      // connect to ethereum
      const web3 = await Eth.connect(dispatch);

      // connect to polkadot
      const polkadotApi = await Polkadot.connect(dispatch);

      // init sdk
      const networkId = (await web3.eth.net.getId());
      /* tslint:disable */
      const sdk = new AssetTransferSdk(
        web3,
        networkId.toString(),
        polkadotApi,
      );
      dispatch(setSdk(sdk));
      /* tslint:enable */

      dispatch(setNetworkConnected(true));
    } catch (e) {
      dispatch(setNetworkConnected(false));
      console.log('failed starting the network!');
      console.log(e);
      throw new Error('failed starting the network!');
    }
  }
}
