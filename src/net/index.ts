import { Dispatch } from 'redux';
import Eth from './eth';
import Polkadot from './polkadot';
import { setIsNetworkConnected } from '../redux/actions/net';

export default class Net {
  // Start net
  public static async start(dispatch: Dispatch): Promise<void> {
    try {
      // connect to ethereum
      await Eth.connect(dispatch);
      // connect to polkadot
      await Polkadot.connect(dispatch);

      dispatch(setIsNetworkConnected(true));
    } catch (e) {
      dispatch(setIsNetworkConnected(false));
      console.log('failed starting the network!');
      console.log(e);
      throw new Error('failed starting the network!');
    }
  }
}
