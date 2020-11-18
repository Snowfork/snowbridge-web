import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import Api, { ApiState } from './api';

// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
/* tslint:enable */

// Eth API connector
type Connector = (e: Eth) => void;

// window wrapper
type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};

export default class Eth extends Api {
  public conn?: Web3;
  public eth_contract?: Contract;
  public erc20_contract?: Contract;

  constructor(connecter: Connector) {
    super();
    connecter(this);
  }

  // Get default web3 account
  // ------------------------
  public async get_account(): Promise<string> {
    if (this!.conn) {
      try {
        const accs = await this.conn.eth.getAccounts();

        if (accs) {
          const defaultAcc = accs[0];
          this.account.address = defaultAcc;
          return defaultAcc;
        } else {
          return '';
        }
      } catch (err) {
        //TODO: handle 'No default Account Error'
        console.log(err);
        return '';
      }
    } else {
      return '';
    }
  }

  // Get ETH balance
  // ---------------
  public async get_balance(): Promise<string | undefined> {
    if (this.account!.address) {
      const acc = this.account!.address;
      const currBalance = await this.conn!.eth.getBalance(acc);
      this.account!.balance = this.conn!.utils.fromWei(currBalance, 'ether');
      return currBalance;
    } else {
      return undefined;
    }
  }

  // Send ETH
  // --------
  public async send_eth(recipient: string, amount: string) {
    try {
      // create a keyring with default options
      const keyring = new Keyring();

      // SS58 formated address to hexadecimal format
      const hexRecipient = keyring.decodeAddress(recipient);

      // hexadecimal formated Address to raw bytes
      const rawRecipient = u8aToHex(hexRecipient, -1, false);

      const recipientBytes = Buffer.from(rawRecipient, 'hex');

      await this.eth_contract!.methods.sendETH(recipientBytes).send({
        from: this!.account!.address,
        gas: 500000,
        value: this!.conn!.utils.toWei(amount, 'ether'),
      });
    } catch (err) {
      //Todo: Error Sending Ethereum
      console.log(err);
    }
  }

  // Set Eth contract
  // ----------------
  public set_eth_contract() {
    try {
      const contract = new this!.conn!.eth.Contract(
        ETHApp.abi as any,
        APP_ETH_CONTRACT_ADDRESS,
      );

      this.eth_contract = contract;
    } catch (err) {
      //Todo: Error fetching ETH contract
      console.log(err);
    }
  }

  // Set ERC20 contract
  // ------------------
  public set_erc20_contract() {
    try {
      const contract = new this!.conn!.eth.Contract(
        ERC20App.abi as any,
        APP_ERC20_CONTRACT_ADDRESS,
      );
      this.erc20_contract = contract;
    } catch (err) {
      //Todo: Error fetching ERC20 contract
      console.log(err);
    }
  }

  // Web3 API connector
  // ------------------
  public static async connect(): Promise<Connector> {
    let locWindow = window as MyWindow;

    let web3: Web3;
    let enabled: boolean = false;
    let state: ApiState;

    if (locWindow.ethereum) {
      web3 = new Web3(locWindow.ethereum);

      try {
        // Request account access if needed
        await locWindow.ethereum.enable();
        enabled = true;
        state = 'success';
        console.log('----- Eth connected ------');
      } catch (error) {
        state = 'failed';
        console.error(error);
      }
    }
    // Legacy dapp browsers...
    else if (locWindow.web3) {
      web3 = locWindow.web3;
      state = 'success';
      enabled = true;
      console.log('----- Injected web3 detected. ------');
    }
    // Fallback to localhost; use dev console port by default...
    else {
      const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(provider);
      state = 'success';
      enabled = true;
      console.log('----- No web3 instance injected, using Local web3. ------');
    }

    return async (eth: Eth) => {
      eth.conn = web3;
      eth.state = state;
      eth.enabled = enabled;

      // get web3 account
      await eth.get_account();

      // Set contracts
      eth.set_eth_contract();
      eth.set_erc20_contract();
    };
  }
}
