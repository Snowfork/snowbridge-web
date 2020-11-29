// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';

// local imports and components
import Bridge from './Bridge';
import Nav from './components/Nav';
import Net, { isConnected } from './net';

import { setNet } from './redux/actions';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

type Props = {
  net: Net;
  setNet: (net: Net) => void;
};

function BridgeApp(props: Props) {
  const { net, setNet } = props;

  // Start Network
  useEffect(() => {
    const start = async () => {
      const net = await new Net();
      await net.start();

      setNet(net);
    };

    start();
  }, []);

  // Check if Network has been started
  if (!isConnected(net)) {
    return <p style={{ textAlign: 'center' }}>Connecting Network</p>;
  }

  return (
    <main>
      <Nav net={net} />
      <Bridge
        net={net!}
        polkadotAddress={net.polkadotAddress}
        ethAddress={net.ethAddress}
      />
    </main>
  );
}

const mapStateToProps = (state: any) => {
  return { net: state.net, setNet: state.setNet };
};

export default connect(mapStateToProps, { setNet })(BridgeApp);
