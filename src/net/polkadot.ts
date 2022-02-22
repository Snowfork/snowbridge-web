import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from '@polkadot/extension-dapp';
import {
  InjectedAccountWithMeta,
} from '@polkadot/extension-inject/types';
import { Dispatch } from 'redux';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import { bundle } from '@snowfork/snowbridge-types';
import {
  setPolkadotAddress,
  setPolkadotApi,
  setPolkadotjsMissing,
  setPolkadotRelayApi,
  subscribeEvents,
} from '../redux/actions/net';

// Config
import { POLKADOT_API_PROVIDER, POLKADOT_RELAY_API_PROVIDER, PARACHAIN_ETHER_ASSET_ID } from '../config';
import Api, { ss58ToU8 } from './api';
import { Asset, isDot, isErc20 } from '../types/Asset';
import { updateBalances } from '../redux/actions/bridge';

import { Channel, PolkadotTxConfirmation } from '../types/types';
import { getChannelID } from '../utils/common';

import { AssetBalance } from '../types/types';

export default class Polkadot extends Api {
  // Get all polkadot addresses
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async getAddresses(): Promise<InjectedAccountWithMeta[]> {
    const allAccounts = await web3Accounts();
    return allAccounts;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async getDefaultAddress(): Promise<InjectedAccountWithMeta> {
    const allAccounts = await web3Accounts();

    if (allAccounts[0]) {
      return allAccounts[0];
    }

    throw new Error('No default polkadot account');
  }

  public static async getAccount(polkadotAddress: string): Promise<InjectedAccountWithMeta> {
    const addresses = await Polkadot.getAddresses();
    const account = addresses
      .filter(
        ({ address }) => address === polkadotAddress,
      );

    if (account[0]) {
      return account[0];
    }

    throw new Error('No valid account for that address');
  }

  public static async getGasCurrencyBalance(
    polkadotApi: ApiPromise, polkadotAddress: string,
  ): Promise<string> {
    try {
      const account:any = await polkadotApi.query.system.account(polkadotAddress);
      if (account.data.free) {
        return account.data.free.toString();
      }
      throw new Error('Polkadot balance not found');
    } catch (err) {
      console.log('error getting polkadot gas balance', err);
      throw err;
    }
  }

  // Query account balance for specified asset
  public static async getAssetBalance(
    polkadotApi: ApiPromise,
    polkadotAddress: string,
    asset: Asset,
  ): Promise<AssetBalance> {
    try {
      let account: any;
      // check if the asset is the native DOT asset and return DOT balance
      if (isDot(asset)) {
        const balance = await Polkadot.getGasCurrencyBalance(polkadotApi, polkadotAddress);
        return { isAssetFound:false, amount:balance };
      }      
      if (isErc20(asset)) {
        let assetId: any = await polkadotApi.query.erc20App.assetId(asset.address);
        if (assetId.isNone) {
          return { isAssetFound:false, amount:'0' };
        }
        assetId = assetId.unwrap()
        account = await polkadotApi.query.assets.account(assetId, polkadotAddress);
      }
      else {
        account = await polkadotApi.query.assets.account(PARACHAIN_ETHER_ASSET_ID, polkadotAddress);
      }
      return { isAssetFound:true,amount:account.balance.toString() };      
    } catch (err) {
      console.log('caught get eth balance', err);
      throw err;
    }
  }

  // Polkadotjs API connector
  public static async connect(dispatch: Dispatch<any>): Promise<void> {
    try {
      // check that the polkadot.js extension is available
      const extensions = await web3Enable('Snowbridge');

      if (extensions.length === 0) {
        throw new Error('PolkadotJS missing');
      }

      const provider = new WsProvider(POLKADOT_API_PROVIDER);

      const api = await ApiPromise.create({
        provider,
        typesBundle: bundle as any,
      });

      // set polkadot api
      dispatch(setPolkadotApi(api));
      console.log('- Polkadot Parachain API endpoint connected');

      // set default polkadot address to first address
      const polkadotAddresses = await Polkadot.getAddresses();
      const firstPolkadotAddress = polkadotAddresses
        && polkadotAddresses[0]
        && polkadotAddresses[0].address;
      if (firstPolkadotAddress) {
        dispatch(setPolkadotAddress(firstPolkadotAddress));
      } else {
        throw new Error('Failed fetching polkadot address');
      }

      const relayProvider = new WsProvider(POLKADOT_RELAY_API_PROVIDER);

      const relayApi = await ApiPromise.create({
        provider: relayProvider,
        typesBundle: bundle as any,
      });

      dispatch(setPolkadotRelayApi(relayApi));
      console.log('- Polkadot Relay Chain API endpoint connected');

      // fetch polkadot account details
      dispatch(updateBalances());

      // Here we subscribe to the parachain events
      dispatch(subscribeEvents());
    } catch (err: any) {
      console.log('error starting polkadot network', err);
      if ((err as any).message === 'PolkadotJS missing') {
        dispatch(setPolkadotjsMissing());
      }
      throw new Error('Poldotjs API endpoint not Connected');
    }
  }

  public static async lockDot(
    polkadotApi: ApiPromise,
    ethAddress: string,
    polkadotAddress: string,
    amount: string,
    channel: Channel,
    callback: (result: any) => void,
  ): Promise<any> {
    const account = await this.getAccount(polkadotAddress);

    if (account) {
      // to be able to retrieve the signer interface from this account
      // we can use web3FromSource which will return an InjectedExtension type
      const injector = await web3FromSource(account.meta.source);

      const channelId = getChannelID(channel);

      return polkadotApi?.tx.dotApp.lock(
        channelId,
        ethAddress,
        amount,
      )
        .signAndSend(account.address, { signer: injector.signer }, callback);
    }

    throw new Error('Failed locking dot');
  }

  public static unlockDot(
    appDotContract: Contract,
    ethAddress: string,
    polkadotAddress: string,
    amount: string,
    channel: Channel,
  ): PromiEvent<Contract> {
    try {
      const amountWrapped = Web3.utils.toBN(amount);
      const recipientBytes = ss58ToU8(polkadotAddress!);

      const channelId = getChannelID(channel);

      return appDotContract?.methods.burn(
        recipientBytes,
        amountWrapped,
        //  TODO: use incentivized channel ID?
        channelId,
      )
        .send({
          from: ethAddress,
          gas: 500000,
          value: 0,
        });
    } catch (err) {
      // Todo: Error Sending Ethereum
      console.log(err);
      throw new Error('failed unlocking DOT');
    }
  }

  public static async getSubTokenIdFromEthTokenId(
    polkadotApi: ApiPromise,
    address: string,
    ethTokenId: string,
  ): Promise<string> {
    return (await polkadotApi.query.erc721App.tokensByERC721Id([address, ethTokenId])).toString();
  }

  public static async burnERC721(
    polkadotApi: ApiPromise,
    subTokenId: number,
    polkadotSenderAddress: string,
    ethRecipient: string,
    channel: Channel,
    callback: (result: any) => void,
  ): Promise<() => void> {
    const account = await this.getAccount(polkadotSenderAddress);
    const injector = await web3FromSource(account.meta.source);
    const channelId = getChannelID(channel);

    return polkadotApi.tx.erc721App.burn(channelId, subTokenId, ethRecipient)
      .signAndSend(account.address, { signer: injector.signer }, callback);
  }

  //Fetch the polkadot transaction confirmation status and nonce value via hash.
  public static async getTransactionConfirmation(
    polkadotApi: ApiPromise,
    transactionHash: string,
    blockNumber: number
  ): Promise<PolkadotTxConfirmation> {
    let nonce: string = '';
    let istxFound = false;
    let latestpolkadotBlock = await polkadotApi.rpc.chain.getBlock();
    let latestblockNumber = latestpolkadotBlock.block.header.number.toNumber();
    for (let index = blockNumber; index <= latestblockNumber; index++) {
      const blockHash = await polkadotApi.rpc.chain.getBlockHash(index);
      const signedBlock = await polkadotApi.rpc.chain.getBlock(blockHash);
      let txStatus = false;

      // the hash for each extrinsic in the block
      signedBlock.block.extrinsics.forEach(async (ex) => {
        txStatus = ex.hash.toHex() == transactionHash ? true : false;
        if (txStatus) {
          if (ex.isSigned) {
            const allRecords: any = await polkadotApi.query.system.events.at(signedBlock.block.header.hash);
            nonce = allRecords[5].event.data[0].toString();
            istxFound = true;
          }
          return { istxFound: istxFound, nonce: nonce };
        }
      });

      if (istxFound)
        return { istxFound: istxFound, nonce: nonce };
    }
    return { istxFound: false, nonce: '' };
  }
}
