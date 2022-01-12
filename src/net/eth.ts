/* eslint-disable no-console */
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Dispatch } from 'redux';
import { Contract } from 'web3-eth-contract';
import { ApiPromise } from '@polkadot/api';
import { web3FromSource } from '@polkadot/extension-dapp';
import { PromiEvent } from 'web3-core';
import Api, { ss58ToU8 } from './api';
import Polkadot from './polkadot';
import Onboard from 'bnc-onboard'
// Import Contracts
import {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  APP_DOT_CONTRACT_ADDRESS,
  APP_ERC721_CONTRACT_ADDRESS,
  INCENTIVIZED_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  PERMITTED_ETH_NETWORK_ID,
  INFURA_KEY
} from '../config';

/* tslint:disable */
import * as ETHApp from '../contracts/ETHApp.json';
import * as ERC20App from '../contracts/ERC20App.json';
import * as IncentivizedInboundChannel from '../contracts/IncentivizedInboundChannel.json';
import * as BasicInboundChannel from '../contracts/BasicInboundChannel.json';
import * as DotApp from '../contracts/DOTApp.json';
import * as ERC721App from '../contracts/ERC721App.json';

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
  setErc721AppContract,
} from '../redux/actions/net';
import * as ERC20Api from './ERC20';
import { updateBalances } from '../redux/actions/bridge';
import {
  Asset, isEther, isNonFungible, NonFungibleToken,
} from '../types/Asset';
import { fetchEthAddress } from '../redux/actions/EthTransactions';
import { Channel } from '../types/types';
import { getChannelID } from '../utils/common';

const wallets: any[] =[
    { walletName: "metamask", preferred: true },  
    {
        walletName: "walletConnect",
        infuraKey: INFURA_KEY,
        preferred: true 
    },   
]
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

    const erc721App = new web3.eth.Contract(
      ERC721App.abi as any,
      APP_ERC721_CONTRACT_ADDRESS,
    );

    dispatch(setErc721AppContract(erc721App));
  }

  // Web3 API connector
  public static async connect(dispatch: Dispatch<any>): Promise<void> {
    const connectionComplete = async () => {
        let web3:any;
        let provider:any;
        try{
            const onboard = Onboard({
                networkId: parseInt(PERMITTED_ETH_NETWORK_ID),  // [Integer] The Ethereum network ID your Dapp uses.
                subscriptions: {
                wallet: (wallet: any) => {
                    web3= new Web3(wallet.provider)
                    dispatch(setWeb3(web3));
                    provider= wallet.provider
                }
                },
                walletSelect: {
                    wallets: wallets 
                }
            });
            let walletselected = await onboard.walletSelect()
            while(! walletselected ){
                walletselected =  await onboard.walletSelect();
            }
            let readyToTransact = await onboard.walletCheck();
            if (!readyToTransact) {
              window.location.reload();
            }
            // Set contracts
            Eth.loadContracts(dispatch, web3);
            // fetch addresses
            await dispatch(fetchEthAddress());
            console.log('- Eth connected');
        }
        catch{
            throw new Error('Something went wrong');        
        }
        return provider;
    };
    try{
        const provider= await connectionComplete();
        if (provider) {
            provider.on('accountsChanged', async (accounts: string[]) => {
                if (accounts[0]) {
                await dispatch(setEthAddress(accounts[0]));
                dispatch(updateBalances());
                } else {
                setEthAddress();
                }
            });

            provider.on('disconnect', async () => {
                setEthAddress();
            });

            provider.on('chainChanged', () => {
                window.location.reload();
            });

            provider.on('disconnect', () => {
                window.location.reload();
            });
        } else {
            dispatch(setMetamaskMissing());
            throw new Error('Metamask not found');
        }
    }
    catch (error)
    {
        console.log('error==',error);
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

          return currentBalance.toString() ?? '0';
        }

        throw new Error('Eth Address not found');
      } else {
        throw new Error('Web3 API not connected');
      }
    } catch (err) {
      console.log(err);
      throw err;
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
 * @param {erc20Contract} Contract web3 contract instance for the erc721 app
 * @return {Promise<void>}
 */
  public static lock(
    amount: string,
    asset: Asset,
    sender: string,
    polkadotRecipient: string,
    ethContract: Contract,
    erc20Contract: Contract,
    erc721AppContract: Contract,
    channel: Channel,
  ): PromiEvent<Contract> {
    try {
      const polkadotRecipientBytes: Uint8Array = ss58ToU8(
        polkadotRecipient!,
      );

      const channelId = getChannelID(channel);

      // call ERC721 app for nfts
      if (isNonFungible(asset)) {
        const token = asset.token as NonFungibleToken;
        return erc721AppContract.methods.lock(
          asset.contract!.options.address,
          token.ethId.toString(),
          polkadotRecipientBytes,
          channelId,
        ).send({
          from: sender,
          gas: 500000,
          value: 0,
        });
      }

      // call ether contract for ether
      if (isEther(asset)) {
        return ethContract.methods
          .lock(polkadotRecipientBytes, channelId)
          .send({
            from: sender,
            gas: 500000,
            value: amount,
          });
      }

      // call the token contract for ERC20
      return erc20Contract.methods
        .lock(
          asset.address,
          polkadotRecipientBytes,
          amount,
          channelId,
        )
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
 * @param {sender} string The ss58 encoded polkadot address of the sender
 * @param {recipient} string The eth recipient address
 * @param {polkadotApi} ApiPromise Polkadot ApiPromise instance
 * @param {extrinsicEventCallback} function callback function for polkadot events
 * @return {Promise<void>}
 */
  public static async unlock(
    amount: string,
    asset: Asset,
    sender: string,
    recipient: string,
    polkadotApi: ApiPromise,
    channel: Channel,
    extrinsicEventCallback: (result: any) => void,
  ): Promise<any> {
    let burnExtrinsic;

    const channelId = getChannelID(channel);
    if (isEther(asset)) {
      burnExtrinsic = polkadotApi.tx.ethApp.burn(
        channelId,
        recipient,
        amount,
      );
    } else {
      burnExtrinsic = polkadotApi.tx.erc20App.burn(
        channelId,
        asset.address,
        recipient,
        amount,
      );
    }
    const account = await Polkadot.getAccount(sender);
    // to be able to retrieve the signer interface from this account
    // we can use web3FromSource which will return an InjectedExtension type
    const injector = await web3FromSource(account.meta.source);

    // passing the injected account address as the first argument of signAndSend
    // will allow the api to retrieve the signer and the user will see the extension
    // popup asking to sign the balance transfer transaction
    return burnExtrinsic
      .signAndSend(
        account.address,
        { signer: injector.signer },
        extrinsicEventCallback,
      );
  }
}
