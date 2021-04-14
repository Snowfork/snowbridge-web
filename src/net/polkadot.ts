import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  web3Accounts,
  web3Enable,
} from '@polkadot/extension-dapp';
import {
  setEthAssetId, setPolkadotAddress, setPolkadotApi, subscribeEvents,
} from '../redux/actions/net';

// Config
import { POLKADOT_API_PROVIDER } from '../config';

import {
  fetchPolkadotGasBalance,
} from '../redux/actions/transactions';
import Api from './api';
import { TokenData } from '../redux/reducers/bridge';

export default class Polkadot extends Api {
  // Get all polkadot addresses
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async getAddresses() {
    // returns an array of all the injected sources
    const extensions = await web3Enable('Snowbridge');

    if (extensions.length === 0) {
      throw new Error('PolkadotJS missing');
    }

    const allAccounts = await web3Accounts();
    return allAccounts;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async getDefaultAddress() {
    const allAccounts = await web3Accounts();

    if (allAccounts[0]) {
      return allAccounts[0];
    }
    return null;
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

  // Query account balance for bridged assets (ETH and ERC20)
  public static async getEthBalance(
    polkadotApi: ApiPromise,
    polkadotAddress: string,
    tokenData?: TokenData,
  ): Promise<string> {
    let ethAssetID = polkadotApi.createType('AssetId', 'ETH');
    // create asset ID for tokens
    if (tokenData?.token?.address && tokenData?.token?.address !== '0x0') {
      ethAssetID = polkadotApi.createType('AssetId', { Token: tokenData?.token?.address });
    }
    try {
      if (polkadotApi) {
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

      // return null;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // Polkadotjs API connector
  public static async connect(dispatch: any): Promise<void> {
    try {
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
      dispatch(setEthAssetId(api.createType('AssetId', 'ETH')));

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
      dispatch(fetchPolkadotGasBalance());
      // Here we subscribe to the parachain events
      dispatch(subscribeEvents());
    } catch (err) {
      console.log(err);
      throw new Error('Poldotjs API endpoint not Connected');
    }
  }
}
