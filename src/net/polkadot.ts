import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

import Api from './api';

// Config
import { POLKADOT_API_PROVIDER } from '../config';

// Polkadot API connector
type Connector = (p: Polkadot) => void;

export default class Polkadot extends Api {
  public conn?: ApiPromise;

  constructor(connector: Connector) {
    super();
    connector(this);
  }

  // Enable polkadotjs extension
  public async enable_extension() {
    const extensions = await web3Enable('Ethereum Bridge');

    if (extensions.length === 0) {
      this.enabled = false;
    } else {
      this.enabled = true;
    }
  }

  // Get default polkadot account
  // ------------------------
  public async get_account(): Promise<string> {
    const allAccounts = await web3Accounts();

    if (allAccounts.length > 0) {
      return allAccounts[0].address;
    }

    return '';
  }

  // Polkadotjs API connector
  // ------------------------
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
        polkadot.state = 'success';
        await polkadot.enable_extension();
        console.log('----- Polkadot connected ------');
      };
    } catch (err) {
      return (polkadot: Polkadot) => {
        polkadot.enabled = false;
        polkadot.state = 'failed';
        console.log('-------- Failed to connect Polkadot API');
      };
    }
  }
}
