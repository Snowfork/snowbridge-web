import Web3 from 'web3';
import Api from './api';

// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
import * as IncentivizedInboundChannel from '../contracts/IncentivizedInboundChannel.json';

/* tslint:enable */
import {
  setERC20Contract,
  setEthContract,
  setIncentivizedChannelContract,
  setMetamaskFound,
  setMetamaskMissing,
  setMetamaskNetwork,
  setWeb3,
} from '../redux/actions/net';
import { fetchEthAddress, fetchEthBalance } from '../redux/actions/transactions';

// window wrapper
type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};
export default class Eth extends Api {

  // Web3 API connector
  public static async connect(dispatch: any){
    let locWindow = window as MyWindow;
    let web3: Web3;

    const connectionComplete = (web3: Web3) => {
      dispatch(setWeb3(web3))
      dispatch(setMetamaskFound());
      web3.eth.net
        .getNetworkType()
        .then((network: string) => dispatch(setMetamaskNetwork(network)));

      // reload app on account change
        locWindow.ethereum.on('accountsChanged', (accounts: Array<string>) => {
          window.location.pathname = '/'
        });
      
      if (web3) {
        // Set contracts
        const ethContract = new web3.eth.Contract(
          ETHApp.abi as any,
          APP_ETH_CONTRACT_ADDRESS,
        );
        dispatch(setEthContract(ethContract))

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


        // fetch addresses
        dispatch(fetchEthAddress())

        // fetch balances
        dispatch(fetchEthBalance())

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
      } else {
        throw new Error('Ethereum Account Not Set');
      }
    } catch (err) {
      console.log(err);
      throw new Error('Ethereum Account Not Set');
    }
  }


/**
 * Get ETH balance of default Ethereum account
 * @param {web3} Web3 web3 instance
 * @return {Promise<string>} The default web3 account
 */
public static async getBalance(conn: Web3): Promise<string> {
  try {
    if (conn) {
      let default_address = await Eth.getAddress(conn);

      if (default_address) {
        const currentBalance = await conn.eth.getBalance(default_address);

        if (currentBalance) {
          return parseFloat(conn.utils.fromWei(currentBalance)).toFixed(4);
        }

        throw new Error('Balance not found');
      }

      throw new Error('Default Address not found');
    } else {
      throw new Error('Web3 API not connected');
    }
  } catch (err) {
    console.log(err);
    throw new Error('Error reading balance');

  }
}

}
