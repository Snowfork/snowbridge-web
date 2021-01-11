// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';

// local imports and components
import Bridge from './Bridge';
import Nav from './components/Nav';
import PendingTransactionsUI from './components/PendingTransactionsUI';
import Net, { isConnected } from './net';
import { useDispatch } from 'react-redux';

import { setNet } from './redux/actions';
import { NetState } from './redux/reducers/net';
import {
  Transaction,
  TransactionsState,
  TransactionStatus,
} from './redux/reducers/transactions';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

type Props = {
  net: any;
  transactions: TransactionsState;
};

function BridgeApp(props: Props) {
  const { net } = props;

  const dispatch = useDispatch();

  // Start Network
  useEffect(() => {
    const start = async () => {
      const net = await new Net();
      await net.start(dispatch);

      dispatch(setNet(net));
    };

    start();
  }, [dispatch]);

  // Check if Network has been started
  if (!isConnected(net.client)) {
    return <p style={{ textAlign: 'center' }}>Connecting Network</p>;
  }

  // Ensure that network is ropsten
  const PERMITTED_METAMASK_NETWORK =
    process.env.PERMITTED_METAMASK_NETWORK || 'ropsten';
  if (
    net.metamaskNetwork.toLowerCase() !==
    PERMITTED_METAMASK_NETWORK.toLowerCase()
  ) {
    return (
      <p style={{ textAlign: 'center', color: '#fff' }}>
        Please select Ropsten network in Metamask extension
      </p>
    );
  }

  // only 1 for now
  let pendingTransaction: Transaction = props.transactions.transactions[0];

  return (
    <main>
      <Nav net={net.client} transactions={props.transactions} />
      {/* <PendingTransactionsUI
        transaction={pendingTransaction}
        isOpen={false}
        closeModal={() => console.log('yes')}
      /> */}
      {/* {pendingTransaction ? (
        <PendingTransactionsUI transaction={pendingTransaction} />
      ) : (
        <Bridge
          net={net.client!}
          polkadotAddress={net.client.polkadotAddress}
          ethAddress={net.client.ethAddress}
        />
      )} */}
      <Bridge
        net={net.client!}
        polkadotAddress={net.client.polkadotAddress}
        ethAddress={net.client.ethAddress}
      />
    </main>
  );
}

const mapStateToProps = (
  state: Props,
): { net: NetState; transactions: TransactionsState } => {
  return { net: state.net, transactions: state.transactions };
};

export default connect(mapStateToProps)(BridgeApp);
