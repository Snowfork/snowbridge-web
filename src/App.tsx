// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';

import { useSelector, useDispatch } from 'react-redux';

// local imports and components
import { ToastContainer } from 'react-toastify';
import {
  Typography,
} from '@material-ui/core';
import Bridge from './components/Bridge/Bridge';
import Nav from './components/Nav';
import Net from './net';

import 'react-toastify/dist/ReactToastify.css';

import { PERMITTED_METAMASK_NETWORK } from './config';
import { RootState } from './redux/reducers';
import { initializeTokens } from './redux/actions/bridge';
import EthTokenList from './components/AppEth/tokenList.json';
import PendingTransactionsModal from './components/PendingTransactionsUI/PendingTransactionsModal';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

function BridgeApp(): JSX.Element {
  const dispatch = useDispatch();
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const {
    isNetworkConnected,
    metamaskNetwork,
    polkadotJSMissing,
  } = useSelector((state: RootState) => state.net);
  const transactions = useSelector((state: RootState) => state.transactions);

  // Start Network
  useEffect(() => {
    const start = async () => {
      await Net.start(dispatch);

      dispatch(initializeTokens(EthTokenList.tokens));
    };

    start();
  }, [dispatch]);

  // open modal for pending transation
  useEffect(() => {
    if (transactions.pendingTransaction) {
      setIsPendingModalOpen(true);
    }
  }, [transactions.pendingTransaction, dispatch]);

  const closeModal = () => {
    setIsPendingModalOpen(false);
  };

  // check if required extensions are missing
  if (polkadotJSMissing) {
    return (
      <Typography color="primary">
        Please install the Polkadot.js extension
        <a href="https://github.com/polkadot-js/extension">Github</a>
      </Typography>
    );
  }

  // Check if Network has been started
  if (!isNetworkConnected) {
    return <Typography color="primary">Connecting Network</Typography>;
  }

  if (
    metamaskNetwork.toLowerCase()
    !== PERMITTED_METAMASK_NETWORK.toLowerCase()
  ) {
    return (
      <p style={{ textAlign: 'center', color: '#fff' }}>
        Please select $
        {PERMITTED_METAMASK_NETWORK}
        {' '}
        network in Metamask extension
      </p>
    );
  }

  return (
    <main>
      <Nav transactions={transactions} />
      <Bridge />
      <PendingTransactionsModal
        isOpen={isPendingModalOpen}
        closeModal={closeModal}
      />
      <ToastContainer autoClose={10000} />
    </main>
  );
}

export default BridgeApp;
