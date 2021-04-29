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
import {
  setPolkadotAddress, setPolkadotApi, setPolkadotJSMissing, subscribeEvents,
} from '../redux/actions/net';

// Config
import { BASIC_CHANNEL_ID, POLKADOT_API_PROVIDER } from '../config';
import Api, { ss58ToU8 } from './api';
import { Asset, isDot, isErc20 } from '../types/Asset';
import { updateBalances } from '../redux/actions/bridge';

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
      const account = await polkadotApi.query.system.account(polkadotAddress);
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
  ): Promise<string> {
    try {
      if (polkadotApi) {
        // check if the asset is the native DOT asset and return DOT balance
        if (isDot(asset)) {
          const balance = await Polkadot.getGasCurrencyBalance(polkadotApi, polkadotAddress);
          return balance;
        }

        let ethAssetID = polkadotApi.createType('AssetId', 'ETH');
        // create asset ID for tokens
        if (isErc20(asset)) {
          ethAssetID = polkadotApi.createType('AssetId', { Token: asset.address });
        }
        if (polkadotAddress) {
          const balance = await polkadotApi.query.assets.balances(
            ethAssetID,
            polkadotAddress,
          );

          return balance.toString();
        }

        throw new Error('Default account not found');
      }
      throw new Error('PolkadotApi not found');
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
        types: {
          Address: 'MultiAddress',
          LookupSource: 'MultiAddress',
          ChannelId: {
            _enum: {
              Basic: null,
              Incentivized: null,
            },
          },
          MessageNonce: 'u64',
          MessageId: {
            channelId: 'ChannelId',
            nonce: 'u64',
          },
          Message: {
            data: 'Vec<u8>',
            proof: 'Proof',
          },
          Proof: {
            blockHash: 'H256',
            txIndex: 'u32',
            data: '(Vec<Vec<u8>>, Vec<Vec<u8>>)',
          },
          EthereumHeader: {
            parentHash: 'H256',
            timestamp: 'u64',
            number: 'u64',
            author: 'H160',
            transactionsRoot: 'H256',
            ommersHash: 'H256',
            extraData: 'Vec<u8>',
            stateRoot: 'H256',
            receiptsRoot: 'H256',
            logBloom: 'Bloom',
            gasUsed: 'U256',
            gasLimit: 'U256',
            difficulty: 'U256',
            seal: 'Vec<Vec<u8>>',
          },
          EthashProofData: {
            dagNodes: '[H512; 2]',
            proof: 'Vec<H128>',
          },
          Bloom: {
            _: '[u8; 256]',
          },
          PruningRange: {
            oldestUnprunedBlock: 'u64',
            oldestBlockToKeep: 'u64',
          },
          AssetId: {
            _enum: {
              ETH: null,
              Token: 'H160',
            },
          },
          InboundChannelData: {
            nonce: 'u64',
          },
          OutboundChannelData: {
            nonce: 'u64',
          },
        },
      });
      // set polkadot api
      dispatch(setPolkadotApi(api));
      console.log('- Polkadot API endpoint connected');

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

      // fetch polkadot account details
      dispatch(updateBalances());

      // Here we subscribe to the parachain events
      dispatch(subscribeEvents());
    } catch (err) {
      if (err.message === 'PolkadotJS missing') {
        dispatch(setPolkadotJSMissing());
      }
      throw new Error('Poldotjs API endpoint not Connected');
    }
  }

  public static async lockDot(
    polkadotApi: ApiPromise,
    ethAddress: string,
    polkadotAddress: string,
    amount: string,
    callback: (result: any) => void,
  ): Promise<any> {
    const account = await this.getAccount(polkadotAddress);

    if (account) {
      // to be able to retrieve the signer interface from this account
      // we can use web3FromSource which will return an InjectedExtension type
      const injector = await web3FromSource(account.meta.source);

      return polkadotApi?.tx.dot.lock(
        BASIC_CHANNEL_ID,
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
  ): PromiEvent<Contract> {
    try {
      const amountWrapped = Web3.utils.toBN(amount);
      const recipientBytes = ss58ToU8(polkadotAddress!);

      return appDotContract?.methods.burn(
        recipientBytes,
        amountWrapped,
        //  TODO: use incentivized channel ID?
        BASIC_CHANNEL_ID,
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
}
