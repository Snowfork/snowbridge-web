/* eslint-disable no-console */
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Dispatch } from 'redux';
import { Contract } from 'web3-eth-contract';
import { ApiPromise } from '@polkadot/api';
import { web3FromSource } from '@polkadot/extension-dapp';
import { PromiEvent } from 'web3-core';
import Api, { ss58ToU8 } from './api';

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
import * as ERC20Api from '../utils/ERC20Api';
import { updateBalances } from '../redux/actions/bridge';
import { Asset, isEther } from '../types/Asset';
import { fetchEthAddress } from '../redux/actions/EthTransactions';

export default class Eth extends Api {
  public static loadContracts(dispatch: Dispatch<any>, web3: Web3): void {
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
  }

  // Web3 API connector
  public static async connect(dispatch: Dispatch<any>): Promise<void> {
    const connectionComplete = async (provider: any) => {
      const web3 = new Web3(provider);
      dispatch(setWeb3(web3));

      await provider.request({ method: 'eth_requestAccounts' });

      web3.eth.net
        .getNetworkType()
        .then((network: string) => dispatch(setMetamaskNetwork(network)));

      // Set contracts
      Eth.loadContracts(dispatch, web3);

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
 * @param {asset} Asset the asset to fetch the balance of
 *
 * @return {Promise<string>} The eth balance of the account
 */
  public static async getTokenBalance(
    conn: Web3,
    ethAddress: string,
    asset: Asset,
  ): Promise<string> {
    // TODO: move these checks to the API
    try {
      if (conn) {
        if (ethAddress) {
          // fetch eth balance when token is undefined
          // or when address is 0x0
          if (isEther(asset)) {
            const currentBalance = await conn.eth.getBalance(ethAddress);
            return currentBalance;
          }
          // fetch erc20 balance
          const currentBalance = await ERC20Api
            .fetchERC20Balance(
              asset.contract,
              ethAddress,
            );

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

  /**
 * Locks tokens on Ethereum and mints tokens on Polkadot
 * @param {amount} string The amount of tokens (in base units) to lock
 * @param {asset} EthAsset The asset to lock
 * @param {sender} string The eth address of the sender
 * @param {polkadotAddress} string The ss58 encoded address of the polkadot recipient
 * @param {ethContract} Contract web3 contract instance for the eth app
 * @param {erc20Contract} Contract web3 contract instance for the erc20 app
 * @return {Promise<void>}
 */
  public static lock(
    amount: string,
    asset: Asset,
    sender: string,
    polkadotRecipient: string,
    ethContract: Contract,
    erc20Contract: Contract,
  ): PromiEvent<any> {
    try {
      const polkadotRecipientBytes: Uint8Array = ss58ToU8(
        polkadotRecipient!,
      );

      // call ether contract for ether
      if (isEther(asset)) {
        return ethContract.methods
        // TODO: SET incentivized channel ID
          .lock(polkadotRecipientBytes, 0)
          .send({
            from: sender,
            gas: 500000,
            value: amount,
          });
      }

      // call the token contract for ERC20
      return erc20Contract.methods
        // TODO: SET incentivized channel ID
        .lock(asset.address, polkadotRecipientBytes, amount, 0)
        .send({
          from: sender,
          gas: 500000,
          value: 0,
        });
    } catch (err) {
      console.log(err);
      throw new Error('Error locking eth asset');
    }
  }

  /**
 * Burns tokens on Polkadot and unlocks tokens on Ethereum
 * @param {amount} string The amount of tokens (in base units) to lock
 * @param {asset} EthAsset The asset to lock
 * @param {sender} any The polkadot account of the sender (InjectedAccountWithMeta)
 * @param {recipient} string The eth recipient address
 * @param {polkadotApi} ApiPromise Polkadot ApiPromise instance
 * @param {extrinsicEventCallback} function callback function for polkadot events
 * @return {Promise<void>}
 */
  public static async unlock(
    amount: string,
    asset: Asset,
    sender: any,
    recipient: string,
    polkadotApi: ApiPromise,
    extrinsicEventCallback: (result: any) => void,
  ): Promise<any> {
    let burnExtrinsic;
    if (isEther(asset)) {
      burnExtrinsic = polkadotApi.tx.eth.burn(
        // TODO: set incentivized channel ID
        0,
        recipient,
        amount,
      );
    } else {
      burnExtrinsic = polkadotApi.tx.erc20.burn(
        // TODO: set incentivized channel ID
        0,
        asset.address,
        recipient,
        amount,
      );
    }

    // to be able to retrieve the signer interface from this account
    // we can use web3FromSource which will return an InjectedExtension type
    const injector = await web3FromSource(sender.meta.source);

    // passing the injected account address as the first argument of signAndSend
    // will allow the api to retrieve the signer and the user will see the extension
    // popup asking to sign the balance transfer transaction
    return burnExtrinsic
      .signAndSend(
        sender.address,
        { signer: injector.signer },
        extrinsicEventCallback,
      );
  }
}
