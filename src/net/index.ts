import { Dispatch } from 'redux';
import Eth from './eth';
import Polkadot from './polkadot';
import { setNetworkConnected } from '../redux/actions/net';

export default class Net {
  // Start net
  public static async start(dispatch: Dispatch): Promise<void> {
    try {
      // connect to ethereum
      await Eth.connect(dispatch);
      // connect to polkadot
      await Polkadot.connect(dispatch);

      dispatch(setNetworkConnected(true));
    } catch (e) {
      dispatch(setNetworkConnected(false));
      console.log('failed starting the network!');
      console.log(e);
      throw new Error('failed starting the network!');
    }
  }
}
