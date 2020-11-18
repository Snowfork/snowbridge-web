import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';

export type ApiState = 'loading' | 'success' | 'failed';

type ApiOption = (e: Api) => void;

type Account = {
  address?: string;
  balance?: string;
};

export default class Api {
  public conn?: Web3 | ApiPromise;
  public enabled: boolean = false;
  public state: ApiState = 'loading';
  public account: Account = { address: undefined, balance: undefined };
}
