// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';

import { ApiPromise, WsProvider } from '@polkadot/api';

// local imports and components
import Bridge from './Bridge';
import Nav from './components/Nav';
import { POLKADOT_API_PROVIDER } from './config';
import Net from './net/';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

function BridgeApp() {
  const [polkadotEnabled, enablePolkadotApi] = useState<
    null | ApiPromise | 'loading'
  >('loading');

  // Start Network
  const [net, initNet] = useState<null | Net>(null);
  useEffect(() => {
    const init = async () => {
      const net = new Net(await Net.start());
      initNet(net);
    };

    init();
  }, []);

  // Connect to Polkadotjs
  useEffect(() => {
    let exe = async () => {
      const wsProvider = new WsProvider(POLKADOT_API_PROVIDER);

      try {
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

        enablePolkadotApi(api);
      } catch (err) {
        console.log(err);
        enablePolkadotApi(null);
      }
    };

    exe();
  }, []);

  if (net === null) {
    return <p style={{ textAlign: 'center' }}>Starting Network</p>;
  }

  switch (net!.eth!.state) {
    case 'loading':
      return <p>Web3 loading</p>;
    case 'success':
      break;
    case 'failed':
      return <p>Failed to connect to Web3</p>;
  }

  if (!polkadotEnabled) {
    return (
      <p style={{ textAlign: 'center' }}>
        Something went wrong while connecting the Polkadotjs API.
      </p>
    );
  } else if (polkadotEnabled === 'loading') {
    return <p style={{ textAlign: 'center' }}>Connecting Polkadotjs API...</p>;
  }

  console.log(net!.eth!.account!.address);

  return (
    <main>
      <Nav net={net} polkadotApi={polkadotEnabled} />
      <Bridge net={net} />
    </main>
  );
}

export default BridgeApp;
