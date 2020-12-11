import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { Dispatch } from 'redux';

import Api from './api';
import Net from './';
import { setPolkadotJSFound, setPolkadotJSMissing } from '../redux/actions';

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

  // Get all polkadot addresses
  public async get_addresses(dispatch: Dispatch) {
    // returns an array of all the injected sources
    const extensions = await web3Enable('Snowbridge');

    if (extensions.length === 0) {
      dispatch(setPolkadotJSMissing());
      return null;
    }
    dispatch(setPolkadotJSFound());

    const allAccounts = await web3Accounts();
    return allAccounts;
  }

  // Query account balance for bridged assets (ETH and ERC20)
  public async get_balance(polkadotAddress:any) {
    try {
      if (this.conn) {
        if (polkadotAddress) {
          let accountData = await this.conn.query.asset.account(
            ETH_ASSET_ID,
            polkadotAddress,
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
  public static async connect(dispatch: Dispatch): Promise<Connector> {
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
        console.log('- Polkadot API endpoint connected');
      };
    } catch (err) {
      console.log(err);
      throw new Error('Poldotjs API endpoint not Connected');
    }
  }
}
