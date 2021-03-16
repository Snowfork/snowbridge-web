import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import Api from './api';
import Net from './';

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

import { Dispatch } from 'redux';
import {
  setERC20Contract,
  setEthContract,
  setIncentivizedChannelContract,
  setMetamaskFound,
  setMetamaskMissing,
  setMetamaskNetwork,
  setWeb3,
} from '../redux/actions';

// Eth API connector
type Connector = (e: Eth, net: any) => void;

// window wrapper
type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};
export default class Eth extends Api {
  public incentivizedChannelContract?: Contract;
  public dispatch: Dispatch;

  constructor(connecter: Connector, net: Net, dispatch: Dispatch) {
    super();
    connecter(this, net);
    this.dispatch = dispatch;
  }

  // Web3 API connector
  public static async connect(dispatch: Dispatch): Promise<Connector> {
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

        console.log('- Eth connected');
      }
    };
  }
}
