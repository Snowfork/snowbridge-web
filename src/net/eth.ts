import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import Api, { ss58_to_u8 } from './api';
import Net from './';

// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
/* tslint:enable */

import { Dispatch } from 'redux';
import {
  setMetamaskFound,
  setMetamaskMissing,
  setMetamaskNetwork,
} from '../redux/actions';
import { addTransaction, updateConfirmations } from '../redux/actions/transactions';
import { TransactionStatus } from '../redux/reducers/transactions';

// Eth API connector
type Connector = (e: Eth, net: any) => void;

// window wrapper
type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};

export default class Eth extends Api {
  public conn?: Web3;
  public eth_contract?: Contract;
  public erc20_contract?: Contract;
  private net: Net;

  constructor(connecter: Connector, net: Net) {
    super();
    this.net = net;
    connecter(this, net);
  }

  // Get default web3 account
  async get_address() {
    if (this!.conn) {
      try {
        const accs = await this.conn.eth.getAccounts();

        if (accs) {
          return accs[0];
        } else {
          throw new Error('Ethereum Account Not Set');
        }
      } catch (err) {
        //TODO: handle 'No default Account Error'
        console.log(err);
      }
    }
  }

  // Get ETH balance of default Ethereum Account
  public async get_balance() {
    try {
      if (this.conn) {
        let default_address = await this.get_address();

        if (default_address) {
          const currBalance = await this.conn.eth.getBalance(default_address);

          if (currBalance) {
            return parseFloat(this.conn.utils.fromWei(currBalance)).toFixed(4);
          }

          throw new Error('Balance not found');
        }

        throw new Error('Default Address not found');
      } else {
        throw new Error('Web3 API not connected');
      }
    } catch (err) {
      //TODO: handle properly
      console.log(err);
    }
  }

  // Send ETH To Default Polkadot Account
  public async send_eth(dispatch: Dispatch, amount: string) {
    try {
      const self: Eth = this;
      let default_address = await self.get_address();
      let transactionHash: string;

      if (default_address) {
        if (self.conn && self.eth_contract) {
          const polkadotAddress: Uint8Array = ss58_to_u8(
            self.net.polkadotAddress,
          );

          await self.eth_contract.methods
            .sendETH(polkadotAddress)
            .send({
              from: default_address,
              gas: 500000,
              value: self.conn.utils.toWei(amount, 'ether'),
            })
            .on('sending', function (payload: any) {
              console.log('Sending Transaction');
            })
            .on('sent', function (payload: any) {
              console.log('Transaction sent');
            })
            .on('transactionHash', function (hash: string) {
              transactionHash = hash;

              dispatch(addTransaction({
                hash,
                confirmations: 0,
                chain: 'eth',
                sender: self.net.ethAddress,
                receiver: self.net.polkadotAddress,
                amount: amount,
                status: TransactionStatus.WAITING_FOR_CONFIRMATION
              })
            )
            })
            .on(
              'confirmation',
              function (
                confirmation: number,
                receipt: any,
                latestBlockHash: string,
              ) {
                console.log('----------- Receipt ----------');
                console.log(receipt);
                console.log('----------- Block ------------');
                console.log(latestBlockHash);

                // update transaction confirmations
                dispatch(updateConfirmations(transactionHash, confirmation))
              },
            )
            .on('error', function (error: Error) {
              throw error;
            });
        }
      } else {
        throw new Error('Default Address not found');
      }
    } catch (err) {
      //Todo: Error Sending Ethereum
      console.log(err);
    }
  }

  // Set Eth contract
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
  public set_erc20_contract() {
    try {
      if (this.conn) {
        const contract = new this.conn.eth.Contract(
          ERC20App.abi as any,
          APP_ERC20_CONTRACT_ADDRESS,
        );

        this.erc20_contract = contract;
      }
    } catch (err) {
      //Todo: Error fetching ERC20 contract
      console.log(err);
    }
  }

  // Web3 API connector
  public static async connect(dispatch: Dispatch): Promise<Connector> {
    let locWindow = window as MyWindow;

    let web3: Web3;

    const connectionComplete = (web3: any) => {
      dispatch(setMetamaskFound());
      web3.eth.net
        .getNetworkType()
        .then((network: string) => dispatch(setMetamaskNetwork(network)));
    };

    if (locWindow.ethereum) {
      web3 = new Web3(locWindow.ethereum);
      connectionComplete(web3);

      try {
        // Request account access if needed
        await locWindow.ethereum.enable();
      } catch (error) {
        console.error(error);
      }
    }

    // Legacy dapp browsers...
    else if (locWindow.web3) {
      web3 = locWindow.web3;
      connectionComplete(web3);

      console.log('- Injected web3 detected');
    }
    // Fallback to localhost; use dev console port by default...
    else {
      dispatch(setMetamaskMissing());
    }

    return (eth: Eth) => {
      if (web3) {
        eth.conn = web3;
        // Set contracts
        eth.set_eth_contract();
        eth.set_erc20_contract();
        console.log('- Eth connected');
      }
    };
  }
}
