import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import Api, { ss58_to_u8 } from './api';
import Net from './';
import { Token } from '../types';

// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  REQUIRED_ETH_CONFIRMATIONS
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
import * as IncentivizedInboundChannel from '../contracts/IncentivizedInboundChannel.json';

/* tslint:enable */

import { Dispatch } from 'redux';
import {
  setMetamaskFound,
  setMetamaskMissing,
  setMetamaskNetwork,
} from '../redux/actions';
import {
  addTransaction,
  setNonce,
  setPendingTransaction,
  updateConfirmations,
} from '../redux/actions/transactions';
import {
  Transaction,
  TransactionStatus,
} from '../redux/reducers/transactions';
import { notify } from '../redux/actions/notifications';

// Eth API connector
type Connector = (e: Eth, net: any) => void;

// window wrapper
type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};

const INCENTIVIZED_CHANNEL_ID = 1;

export default class Eth extends Api {
  public conn?: Web3;
  public eth_contract?: Contract;
  public erc20_contract?: Contract;
  public incentivizedChannelContract?: Contract;
  private net: Net;
  public dispatch: Dispatch;

  constructor(connecter: Connector, net: Net, dispatch: Dispatch) {
    super();
    this.net = net;
    connecter(this, net);
    this.dispatch = dispatch;
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

  // Lockup ETH To Default Polkadot Account via Incentivized Channel
  public async send_eth(amount: string, token: Token) {
    try {
      const self: Eth = this;
      let default_address = await self.get_address();
      let transactionHash: string;

      if (default_address) {
        if (self.conn && self.eth_contract) {
          const polkadotAddress: Uint8Array = ss58_to_u8(
            self.net.polkadotAddress,
          );

          const pendingTransaction: Transaction = {
            hash: '',
            confirmations: 0,
            sender: self.net.ethAddress,
            receiver: self.net.polkadotAddress,
            amount: amount,
            status: TransactionStatus.SUBMITTING_TO_CHAIN,
            isMinted: false,
            isBurned: false,
            chain: 'eth',
            token
          }

          const promiEvent = self.eth_contract.methods
            .lock(polkadotAddress, INCENTIVIZED_CHANNEL_ID)
            .send({
              from: default_address,
              gas: 500000,
              value: self.conn.utils.toWei(amount, 'ether'),
            })
            .on('sending', async function (payload: any) {
              console.log('Sending Transaction', payload);
              // create transaction with default values to display in the modal
              self.dispatch(setPendingTransaction(pendingTransaction));
            })
            .on('sent', async function (payload: any) {
              console.log('Transaction sent', payload);
            })
            .on('transactionHash', async function (hash: string) {
              console.log('Transaction hash received', hash);
              transactionHash = hash;

              self.dispatch(
                addTransaction({
                  hash,
                  confirmations: 0,
                  sender: self.net.ethAddress,
                  receiver: self.net.polkadotAddress,
                  amount: amount,
                  status: TransactionStatus.WAITING_FOR_CONFIRMATION,
                  isMinted: false,
                  isBurned: false,
                  chain: 'eth',
                  token
                }),
              );

              self.dispatch(notify({ text: "ETH to SnowETH Transaction created" }));
            })
            .on('receipt', async function (receipt: any) {
              console.log('Transaction receipt received', receipt);
              const outChannelLogFields = [
                {
                  type: 'address',
                  name: 'source'
                },
                {
                  type: 'uint64',
                  name: 'nonce'
                },
                {
                  type: 'bytes',
                  name: 'payload',
                }
              ];
              const channelEvent = receipt.events[0];
              const decodedEvent = self.conn!.eth.abi.decodeLog(outChannelLogFields, channelEvent.raw.data, channelEvent.raw.topics);
              const nonce = decodedEvent.nonce;
              self.dispatch(
                setNonce(transactionHash, nonce),
              );
            })
            .on(
              'confirmation',
              function (
                confirmation: number,
                receipt: any,
              ) {
                console.log(`Got confirmation ${confirmation} for ${receipt.transactionHash}`);
                // update transaction confirmations
                self.dispatch(
                  updateConfirmations(receipt.transactionHash, confirmation),
                );

                if (confirmation === REQUIRED_ETH_CONFIRMATIONS) {
                  self.dispatch(notify({
                    text: `Transactions confirmed after ${confirmation} confirmations`,
                    color: 'success'
                  }));
                  promiEvent.off('confirmation');
                }
              },
            )
            .on('error', function (error: Error) {
              // TODO: render error message
              self.dispatch(setPendingTransaction({
                ...pendingTransaction,
                status: TransactionStatus.REJECTED,
              }));

              self.dispatch(notify({
                text: `Transaction Error`,
                color: 'error'
              }));
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

  // Set Incentivized Channel contract
  public setIncentivizedChannelContract() {
    try {
      if (this.conn) {
        const contract = new this.conn.eth.Contract(
          IncentivizedInboundChannel.abi as any,
          INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
        );

        this.incentivizedChannelContract = contract;
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
        eth.setIncentivizedChannelContract();

        console.log('- Eth connected');
      }
    };
  }
}
