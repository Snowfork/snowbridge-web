/* eslint-disable no-console */
import Web3 from 'web3';
import Api from './api';

// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
import * as IncentivizedInboundChannel from '../contracts/IncentivizedInboundChannel.json';
import * as BasicInboundChannel from '../contracts/BasicInboundChannel.json';

/* tslint:enable */
import {
  setBasicChannelContract,
  setERC20Contract,
  setEthAddress,
  setEthContract,
  setIncentivizedChannelContract,
  setMetamaskMissing,
  setMetamaskNetwork,
  setWeb3,
} from '../redux/actions/net';
import { fetchEthAddress } from '../redux/actions/transactions';
import { TokenData } from '../redux/reducers/bridge';
import * as ERC20Api from '../utils/ERC20Api';
import { updateBalances } from '../redux/actions/bridge';

// window wrapper
type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};
export default class Eth extends Api {
  // Web3 API connector
  public static async connect(dispatch: any): Promise<void> {
    const locWindow = window as MyWindow;
    let web3: Web3;

    const connectionComplete = async (web3: Web3) => {
      dispatch(setWeb3(web3));
      // dispatch(setMetamaskFound());
      web3.eth.net
        .getNetworkType()
        .then((network: string) => dispatch(setMetamaskNetwork(network)));

      // handle metamask account changes
      locWindow.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts[0]) {
          await dispatch(setEthAddress(accounts[0]));
          dispatch(updateBalances());
        }
      });

      if (web3) {
        // Set contracts
        const ethContract = new web3.eth.Contract(
          ETHApp.abi as any,
          APP_ETH_CONTRACT_ADDRESS,
        );
        dispatch(setEthContract(ethContract));

        const erc20contract = new web3.eth.Contract(
          ERC20App.abi as any,
          APP_ERC20_CONTRACT_ADDRESS,
        );
        dispatch(setERC20Contract(erc20contract));

        const incentivizedChannelContract = new web3.eth.Contract(
          IncentivizedInboundChannel.abi as any,
          INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
        );
        dispatch(setIncentivizedChannelContract(incentivizedChannelContract));

        const basicChannelContract = new web3.eth.Contract(
          BasicInboundChannel.abi as any,
          BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
        );
        dispatch(setBasicChannelContract(basicChannelContract));

        // fetch addresses
        await dispatch(fetchEthAddress());

        console.log('- Eth connected');
      }
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
    } else if (locWindow.web3) {
      // Legacy dapp browsers...
      web3 = locWindow.web3;
      connectionComplete(web3);

      console.log('- Injected web3 detected');
    } else {
      // Fallback to localhost; use dev console port by default...
      dispatch(setMetamaskMissing());
    }
  }

  /**
   * Get default web3 account
   * @param {web3} Web3 web3 instance
   * @return {Promise<string>} The default web3 account
   */
  public static async getAddress(web3: Web3): Promise<string> {
    try {
      const accs = await web3.eth.getAccounts();

      if (accs) {
        return accs[0];
      }
      throw new Error('Ethereum Account Not Set');
    } catch (err) {
      console.log(err);
      throw new Error('Ethereum Account Not Set');
    }
  }

  /**
 * Get ETH balance of the specified eth address if the token is null or the
 * address = 0x0 otherwise return the ERC20 balance
 * @param {web3} Web3 web3 instance
 * @param {address} string eth address
 * @param {token} TokenData token metadata and contract instance
 *
 * @return {Promise<string>} The eth balance of the account
 */
  public static async getTokenBalance(
    conn: Web3,
    ethAddress: string,
    token?: TokenData,
  ): Promise<string> {
    try {
      if (conn) {
        if (ethAddress) {
          // fetch eth balance when token is undefined
          // or when address is 0x0
          if (token?.token?.address === '0x0' || !token) {
            const currentBalance = await conn.eth.getBalance(ethAddress);
            return currentBalance;
          }
          // fetch erc20 balance
          const currentBalance = await ERC20Api.fetchERC20Balance(token!.instance, ethAddress);

          if (currentBalance) {
            return currentBalance.toString();
          }

          throw new Error('Balance not found');
        }

        throw new Error('Eth Address not found');
      } else {
        throw new Error('Web3 API not connected');
      }
    } catch (err) {
      console.log(err);
      throw new Error('Error reading balance');
    }
  }
}
