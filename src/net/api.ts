import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';

export type ApiState = 'loading' | 'success' | 'failed';

export default class Api {
  public conn?: Web3 | ApiPromise;
  public enabled: boolean = false;
  public state: ApiState = 'loading';
}
