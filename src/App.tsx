// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';

// local imports and components
import Bridge from './Bridge';
import Nav from './components/Nav';
import Net from './net';

import { setNet } from './redux/actions';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

type Props = {
  net: Net;
  setNet: (net: Net) => void;
};

function BridgeApp(props: Props) {
  const { net, setNet } = props;
  console.log(net);
  const [polkadotAddress, setPolkadotAddress] = useState(String);
  const [ethAddress, setEthAddress] = useState(String);
  const [ethBalance, setEthBalance] = useState(String);

  // Start Network
  useEffect(() => {
    const init = async () => {
      const net = new Net(await Net.start());

      if (net && net.polkadot && net.eth) {
        const eAddress = await net.eth.get_account();
        const pAddress = await net.polkadot.get_account();
        const eBalance = await net.eth.get_balance();

        if (eAddress) setEthAddress(eAddress);
        if (pAddress) setPolkadotAddress(pAddress);
        if (eBalance && eBalance !== undefined) setEthBalance(eBalance);

        setNet(net);
      }
    };

    init();
  }, []);

  if (net && net.state) {
    switch (net.state) {
      case 'loading':
        return <p style={{ textAlign: 'center' }}>Starting Network</p>;
      case 'failed':
        return <p style={{ textAlign: 'center' }}>Failed to start Network</p>;
    }
  }

  return (
    <main>
      <Nav
        polkadotAddress={polkadotAddress}
        ethAddress={ethAddress}
        ethBalance={ethBalance}
      />
      <Bridge net={net!} />
    </main>
  );
}

const mapStateToProps = (state: any) => {
  return { net: state.net, setNet: state.setNet };
};

export default connect(mapStateToProps, { setNet })(BridgeApp);
