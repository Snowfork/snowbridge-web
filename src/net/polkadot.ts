import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

import Api from './api';
import Net from './';

// Config
import { POLKADOT_API_PROVIDER } from '../config';
import { ETH_ASSET_ID } from '../config';

// Polkadot API connector
type Connector = (p: Polkadot, net: any) => void;

interface AssetAccountData {
  [free: string]: any;
}

export default class Polkadot extends Api {
  public conn?: ApiPromise;
  public net: Net;

  constructor(connector: Connector, net: any) {
    super();
    this.net = net;
    connector(this, net);
  }

  // Get default polkadot address
  public async get_address() {
    // returns an array of all the injected sources
    const extensions = await web3Enable('Ethereum Bridge');

    if (extensions.length === 0) {
      // TODO: handle properly
      throw new Error('Polkadotjs Extension Not Found');
    }

    const allAccounts = await web3Accounts();

    if (allAccounts.length > 0) {
      return allAccounts[0].address;
    } else {
      // TODO: handle properly?
      throw new Error('Default Ethereum Account not set!');
    }
  }

  // Query account balance for bridged assets (ETH and ERC20)
  public async get_balance() {
    try {
      if (this.conn) {
        let default_address = await this.get_address();

        if (default_address) {
          let accountData = await this.conn.query.asset.account(
            ETH_ASSET_ID,
            default_address,
          );

          if ((accountData as AssetAccountData).free) {
            return (accountData as AssetAccountData).free;
          }
        }

        throw new Error('Default account not found');
      }

      return null;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // Polkadotjs API connector
  public static async connect(): Promise<Connector> {
    try {
      const wsProvider = new WsProvider(POLKADOT_API_PROVIDER);

      const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
          Address: 'AccountId',
          LookupSource: 'AccountId',
          AppId: '[u8; 20]',
          Message: {
            payload: 'Vec<u8>',
            verification: 'VerificationInput',
          },
          VerificationInput: {
            _enum: {
              Basic: 'VerificationBasic',
              None: null,
            },
          },
          VerificationBasic: {
            blockNumber: 'u64',
            eventIndex: 'u32',
          },
          TokenId: 'H160',
          BridgedAssetId: 'H160',
          AssetAccountData: {
            free: 'U256',
          },
        },
      });

      return async (polkadot: Polkadot) => {
        polkadot.conn = api;
        console.log('- Polkadot connected');
      };
    } catch (err) {
      console.log(err);
      throw new Error('Poldotjs not Connected');
    }
  }
}
