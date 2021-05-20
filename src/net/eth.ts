/* eslint-disable no-console */
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Dispatch } from 'redux';
import { AssetTransferSdk } from 'asset-transfer-sdk/lib';
import { Asset } from 'asset-transfer-sdk/lib/types';
import { isEther } from 'asset-transfer-sdk/lib/utils';

import Api from './api';

/* tslint:enable */
import {
  setEthAddress,
  setMetamaskMissing,
  setMetamaskNetwork,
  setWeb3,
} from '../redux/actions/net';
import { updateBalances } from '../redux/actions/bridge';
import { fetchEthAddress } from '../redux/actions/EthTransactions';

export default class Eth extends Api {
  // Web3 API connector
  public static async connect(dispatch: Dispatch<any>): Promise<Web3> {
    const provider = await detectEthereumProvider() as any;

    if (provider) {
      // store web 3
      const web3 = new Web3(provider);
      await dispatch(
        setWeb3(web3),
      );

      // request accounts
      await provider.request({ method: 'eth_requestAccounts' });

      // fetch current network
      dispatch(setMetamaskNetwork(provider.chainId));

      // fetch eth address
      await dispatch(fetchEthAddress());
      console.log('connected');

      // event listeners

      provider.on('accountsChanged', async (accounts: string[]) => {
        if (accounts[0]) {
          await dispatch(setEthAddress(accounts[0]));
          dispatch(updateBalances());
        }
      });

      provider.on('chainChanged', () => {
        window.location.reload();
      });

      return web3;
    }
    dispatch(setMetamaskMissing());
    throw new Error('Metamask not found');
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
 * @param {asset} Asset the asset to fetch the balance of
 *
 * @return {Promise<string>} The eth balance of the account
 */
  public static async getTokenBalance(
    sdk: AssetTransferSdk,
    ethAddress: string,
    asset: Asset,
  ): Promise<string> {
    if (isEther(asset)) {
      // return ether balance;
      return sdk.ethClient!.getEtherBalance(ethAddress);
    }
    // fetch erc20 balance
    return sdk.ethClient!.getERC20Balance(ethAddress, asset.address);
  }
}
