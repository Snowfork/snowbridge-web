import Web3 from 'web3';

export type ApiState = 'loading' | 'success' | 'failed';

export type Conn = Web3;

type ApiOption = (e: Api) => void;

type Account = {
  address?: string;
  balance: string | null;
};

type Connector = (a: Api) => void;

export default class Api {
  public web3?: Conn;
  public enabled: boolean = false;
  public state: ApiState = 'loading';
  public account?: Account;
}
