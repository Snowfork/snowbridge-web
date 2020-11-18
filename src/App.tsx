// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';

// local imports and components
import Bridge from './Bridge';
import Nav from './components/Nav';
import Net from './net/';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

function BridgeApp() {
  // Start Network
  const [net, initNet] = useState<null | Net>(null);
  useEffect(() => {
    const init = async () => {
      const net = new Net(await Net.start());
      initNet(net);
    };

    init();
  }, []);

  if (net?.state === 'loading') {
    return <p style={{ textAlign: 'center' }}>Starting Network</p>;
  }

  return (
    <main>
      <Nav net={net!} />
      <Bridge net={net!} />
    </main>
  );
}

export default BridgeApp;
