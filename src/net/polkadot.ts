import web3 from 'web3';
import { ApiPromise, WsProvider, } from '@polkadot/api';
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from '@polkadot/extension-dapp';
import {formatBalance} from '@polkadot/util'
import { Dispatch } from 'redux';
import Api from './api';
import Net from './';
import { setPolkadotJSFound, setPolkadotJSMissing } from '../redux/actions';
import _ from 'lodash';
import { Token } from '../types';

// Config
import { POLKADOT_API_PROVIDER } from '../config';

import { addTransaction, ethMessageDispatched, setTransactionStatus, updateTransaction, parachainMessageDispatched, setPendingTransaction } from '../redux/actions/transactions';
import { MessageDispatchedEvent, Transaction, TransactionStatus } from '../redux/reducers/transactions';

const INCENTIVIZED_CHANNEL_ID = 1;

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

  public async get_gas_currency_balance(polkadotAddress: string): Promise<string> {
    try {
      const account = await this.conn?.query.system.account(polkadotAddress);
      
      return formatBalance(account!.data!.free, {
        decimals: this.conn?.registry.chainDecimals[0],
        withUnit: this.conn?.registry.chainTokens[0]
      })
    } catch (err) {
      console.log('error getting polkadot gas balance', err)
      throw err;
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

  public async burn_token(amount: string, token: Token) {

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
          status: TransactionStatus.SUBMITTING_TO_CHAIN,
          isMinted: false,
          isBurned: false,
          chain: 'polkadot',
          token
        }
        self.dispatch(setPendingTransaction(pendingTransaction));

        const polkaWeiValue = web3.utils.toWei(amount, 'ether');

        let burnExtrinsic;
        if (token.address === '0x0') {
          burnExtrinsic = self.conn.tx.eth.burn(
            INCENTIVIZED_CHANNEL_ID,
            recepient,
            polkaWeiValue,
          );
        } else {
          burnExtrinsic = self.conn.tx.erc20.burn(
            INCENTIVIZED_CHANNEL_ID,
            token.address,
            recepient,
            polkaWeiValue,
          );

        }


        // to be able to retrieve the signer interface from this account
        // we can use web3FromSource which will return an InjectedExtension type
        const injector = await web3FromSource(account.meta.source);

        // passing the injected account address as the first argument of signAndSend
        // will allow the api to retrieve the signer and the user will see the extension
        // popup asking to sign the balance transfer transaction
        burnExtrinsic
          .signAndSend(
            account.address,
            { signer: injector.signer },
            (result) => {
              if (result.status.isReady) {
                pendingTransaction.hash = result.status.hash.toString();
                self.dispatch(addTransaction({ ...pendingTransaction, status: TransactionStatus.WAITING_FOR_CONFIRMATION }));
              }
              if (result.status.isInBlock) {
                const nonce = result.events[0].event.data[1].toString();
                self.dispatch(updateTransaction(pendingTransaction.hash, { nonce, status: TransactionStatus.FINALIZED_ON_CHAIN }));
                // subscribe to ETH dispatch event
                self.net.eth?.incentivizedChannelContract?.events.MessageDispatched({})
                  .on('data', (
                    event: MessageDispatchedEvent
                  ) => {
                    if (
                      event.returnValues.nonce === nonce
                    ) {
                      self.dispatch(ethMessageDispatched(event.returnValues.nonce, pendingTransaction.nonce!));
                    }
                  });
              }
              else if (result.status.isFinalized) {
                self.dispatch(setTransactionStatus(pendingTransaction.hash, TransactionStatus.FINALIZED_ON_CHAIN))
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
      this.conn.query.system.events((eventRecords) => {
        const dispatchEvents = _.filter(eventRecords, eR => eR.event.section === 'dispatch')
        dispatchEvents.forEach(({ event }) => {
          const nonce = (event.data as any)[0].nonce.toString();
          // TODO: const dispatchSuccessNotification = (text: string) => this.dispatch(notify({ text, color: "success" }));
          console.log(`Got new dispatch event with nonce: ${nonce}`);
          this.dispatch(parachainMessageDispatched(nonce));
        });
        // TODO: update new Polkadot account balance
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
          "MessageNonce": "u64",
          "MessageId": {
            "channelId": "ChannelId",
            "nonce": "u64"
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
          "PruningRange": {
            "oldestUnprunedBlock": "u64",
            "oldestBlockToKeep": "u64"
          },
          "AssetId": {
            "_enum": {
              "ETH": null,
              "Token": "H160"
            }
          },
          "InboundChannelData": {
            "nonce": "u64"
          },
          "OutboundChannelData": {
            "nonce": "u64"
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
