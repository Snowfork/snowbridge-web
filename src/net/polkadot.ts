import web3 from 'web3';
import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from '@polkadot/extension-dapp';
import { Dispatch } from 'redux';
import Api from './api';
import Net from './';
import { setPolkadotJSFound, setPolkadotJSMissing } from '../redux/actions';

// Config
import { POLKADOT_API_PROVIDER } from '../config';

import { addTransaction, ethUnlockedEvent, polkaEthBurned, polkaEthMinted, setPendingTransaction } from '../redux/actions/transactions';
import { EthUnlockEvent, Transaction, TransactionStatus } from '../redux/reducers/transactions';
import { notify } from '../redux/actions/notifications';

const BigNumber = require('bignumber.js');

// Polkadot API connector
type Connector = (p: Polkadot, net: any) => void;

export default class Polkadot extends Api {
  public conn?: ApiPromise;
  public ethAssetID: any;
  public net: Net;
  public dispatch: Dispatch;

  constructor(connector: Connector, net: any, dispatch: Dispatch) {
    super();
    this.net = net;
    connector(this, net);
    this.dispatch = dispatch;
  }

  // Get all polkadot addresses
  public async get_addresses() {
    // returns an array of all the injected sources
    const extensions = await web3Enable('Snowbridge');

    if (extensions.length === 0) {
      this.dispatch(setPolkadotJSMissing());
      return null;
    }
    this.dispatch(setPolkadotJSFound());

    const allAccounts = await web3Accounts();
    return allAccounts;
  }

  public async get_default_address() {
    const allAccounts = await web3Accounts();

    if (allAccounts[0]) {
      return allAccounts[0];
    } else {
      return null;
    }
  }

  // Query account balance for bridged assets (ETH and ERC20)
  public async get_eth_balance(polkadotAddress: any) {
    try {
      if (this.conn) {
        if (polkadotAddress) {
          let balance = await this.conn.query.assets.balances(
            this.ethAssetID,
            polkadotAddress,
          );

          return web3.utils.fromWei(
            (balance as any).toString(),
            'ether',
          );
        }

        throw new Error('Default account not found');
      }

      return null;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async burn_polkaeth(amount: string) {
    const self = this;

    if (self.conn) {
      const account = await self.get_default_address();
      const recepient = self.net.ethAddress;

      if (account) {
        const pendingTransaction: Transaction = {
          hash: '',
          confirmations: 0,
          sender: self.net.polkadotAddress,
          receiver: self.net.ethAddress,
          amount: amount,
          status: TransactionStatus.SUBMITTING_TO_ETHEREUM,
          isMinted: false,
          isBurned: false,
          chain: 'polkadot',
          assets: {
            deposited: 'polkaEth',
            recieved: 'eth'
          }
        }
        self.dispatch(setPendingTransaction(pendingTransaction));



        // subscribe to ETH unlock event
        const unlockEventSubscription = self.net.eth?.eth_contract?.events.Unlock({})
          .on('data', (
            event: EthUnlockEvent
          ) => {
            // TODO: find a better way to link this event to the transaction
            if (
              self.net.eth?.conn?.utils.fromWei(event.returnValues._amount) === pendingTransaction.amount &&
              event.returnValues._recipient === pendingTransaction.receiver
            ) {
              self.dispatch(ethUnlockedEvent(event, pendingTransaction));
            }
          })

        const polkaWeiValue = web3.utils.toWei(amount, 'ether');

        const transferExtrinsic = self.conn.tx.eth.burn(
          recepient,
          polkaWeiValue,
        );

        // to be able to retrieve the signer interface from this account
        // we can use web3FromSource which will return an InjectedExtension type
        const injector = await web3FromSource(account.meta.source);

        // passing the injected account address as the first argument of signAndSend
        // will allow the api to retrieve the signer and the user will see the extension
        // popup asking to sign the balance transfer transaction
        transferExtrinsic
          .signAndSend(
            account.address,
            { signer: injector.signer },
            ({ status }) => {
              if (status.isInBlock) {
                console.log(
                  `Completed at block hash #${status.asInBlock.toString()}`,
                );
              } else {
                console.log(`Current status: ${status.type}`);
                // transaction is now considered as submitted
                if (status.isReady) {
                  self.dispatch(addTransaction({ ...pendingTransaction, status: TransactionStatus.WAITING_FOR_CONFIRMATION }));
                }
              }
            },
          )
          .catch((error: any) => {
            console.log(':( transaction failed', error);
            if (error.toString() === 'Error: Cancelled') {
              self.dispatch(setPendingTransaction({ ...pendingTransaction, status: TransactionStatus.REJECTED }));
            } else {
              // TODO: display error in modal
            }
            unlockEventSubscription?.unsubscribe();
          });
      } else {
        throw new Error('Default Polkadot account not found');
      }
    } else {
      throw new Error('Polkadot API not connected');
    }
  }

  // Subscribe to Parachain events
  public async subscribeEvents() {
    if (this.conn) {
      this.conn.query.system.events((events) => {
        console.log(`\nReceived ${events.length} events`);
        console.log({ events });
        // Loop through the events in the current block
        events.forEach((record) => {
          const { event } = record;

          // Checks if the parachain emited event is for a Minted asset
          if (event.section === 'asset' && event.method === 'Minted') {
            console.log('Got Assets.Minted event');

            // Notify local transaction object the asset is minted
            this.dispatch(polkaEthMinted({
              // Receiver of the sent PolkaEth
              accountId: event.data[1].toString(),
              // PolkaEth amount
              amount: web3.utils.fromWei(event.data[2].toString()),
            }
            ));

            this.dispatch(notify({ text: "PolkaEth Minted", color: "success" }));
            // Checks if the parachain emited event is for a burned
          } else if (event.section === 'asset' && event.method === 'Burned') {
            console.log('Got Assets.Burned event');

            // Notify local transaction object the asset is burned
            this.dispatch(polkaEthBurned({
              accountId: event.data[1].toString(),
              amount: web3.utils.fromWei(event.data[2].toString()),
            }
            ));

            this.dispatch(notify({ text: "PolkaEth Burned", color: "success" }));
          }

          // TODO: update new Polkadot account balance
        });
      });
    } else {
      throw new Error('Polkadot API not connected');
    }
  }

  // Polkadotjs API connector
  public static async connect(dispatch: Dispatch): Promise<Connector> {
    try {
      const provider = new WsProvider(POLKADOT_API_PROVIDER);

      const api = await ApiPromise.create({
        provider,
        types: {
          "Address": "MultiAddress",
          "LookupSource": "MultiAddress",
          "ChannelId": {
            "_enum": {
              "Basic": null,
              "Incentivized": null
            }
          },
          "Message": {
            "data": "Vec<u8>",
            "proof": "Proof"
          },
          "Proof": {
            "blockHash": "H256",
            "txIndex": "u32",
            "data": "(Vec<Vec<u8>>, Vec<Vec<u8>>)"
          },
          "EthereumHeader": {
            "parentHash": "H256",
            "timestamp": "u64",
            "number": "u64",
            "author": "H160",
            "transactionsRoot": "H256",
            "ommersHash": "H256",
            "extraData": "Vec<u8>",
            "stateRoot": "H256",
            "receiptsRoot": "H256",
            "logBloom": "Bloom",
            "gasUsed": "U256",
            "gasLimit": "U256",
            "difficulty": "U256",
            "seal": "Vec<Vec<u8>>"
          },
          "EthashProofData": {
            "dagNodes": "[H512; 2]",
            "proof": "Vec<H128>"
          },
          "Bloom": {
            "_": "[u8; 256]"
          },
          "AssetId": {
            "_enum": {
              "ETH": null,
              "Token": "H160"
            }
          }
        }
      });


      return async (polkadot: Polkadot) => {
        polkadot.conn = api;
        polkadot.ethAssetID = api.createType('AssetId', 'ETH');

        // Here we subscribe to the parachain events
        await polkadot.subscribeEvents();

        console.log('- Polkadot API endpoint connected');
      };
    } catch (err) {
      console.log(err);
      throw new Error('Poldotjs API endpoint not Connected');
    }
  }
}
