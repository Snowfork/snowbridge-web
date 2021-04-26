/* eslint-disable no-console */
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import Api from './api';

// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  APP_DOT_CONTRACT_ADDRESS,
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
import * as IncentivizedInboundChannel from '../contracts/IncentivizedInboundChannel.json';
import * as BasicInboundChannel from '../contracts/BasicInboundChannel.json';
import * as DotApp from '../contracts/DOTApp.json';

/* tslint:enable */
import {
  setAppDotContract,
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

export default class Eth extends Api {
  // Web3 API connector
  public static async connect(dispatch: any): Promise<void> {
    const connectionComplete = async (provider: any) => {
      const web3 = new Web3(provider);
      dispatch(setWeb3(web3));

      await provider.request({ method: 'eth_requestAccounts' });

      web3.eth.net
        .getNetworkType()
        .then((network: string) => dispatch(setMetamaskNetwork(network)));

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

      const appDotContract = new web3.eth.Contract(
        DotApp.abi as any,
        APP_DOT_CONTRACT_ADDRESS,
      );
      dispatch(setAppDotContract(appDotContract));

      // fetch addresses
      await dispatch(fetchEthAddress());

      console.log('- Eth connected');
    };

    const provider = await detectEthereumProvider() as any;

    if (provider) {
      await connectionComplete(provider);

      provider.on('accountsChanged', async (accounts: string[]) => {
        if (accounts[0]) {
          await dispatch(setEthAddress(accounts[0]));
          dispatch(updateBalances());
        }
      });
    } else {
      dispatch(setMetamaskMissing());
      throw new Error('Metamask not found');
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
