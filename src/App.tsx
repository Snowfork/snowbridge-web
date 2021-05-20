// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

import { useDispatch } from 'react-redux';

// local imports and components
import { ToastContainer } from 'react-toastify';
import {
  Paper,
  Typography,
} from '@material-ui/core';
import Bridge from './components/Bridge/Bridge';
import Nav from './components/Nav';
import Net from './net';

import 'react-toastify/dist/ReactToastify.css';

import { PERMITTED_METAMASK_NETWORK } from './config';
import { initializeTokens } from './redux/actions/bridge';
import { useAppSelector } from './utils/hooks';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

function BridgeApp(): JSX.Element {
  const dispatch = useDispatch();
  const {
    isNetworkConnected,
    metamaskNetwork,
    polkadotJSMissing,
    metamaskMissing,
  } = useAppSelector((state) => state.net);

  // Start Network
  useEffect(() => {
    const start = async () => {
      Net.start(dispatch)
        .then(() => {
          dispatch(initializeTokens());
        })
        .catch((e) => {
          console.log('error starting network', e);
        });
    };

    start();
  }, [dispatch]);

  // check if required extensions are missing
  if (polkadotJSMissing) {
    return (
      <Paper>
        <Typography color="primary" variant="h2" align="center">
          Please install the
          {' '}
          <a href="https://github.com/polkadot-js/extension">
            Polkadot.js extension
          </a>
        </Typography>
      </Paper>
    );
  }

  if (metamaskMissing) {
    return (
      <Paper>
        <Typography color="primary" variant="h2" align="center">
          Please install the
          {' '}
          <a href="https://metamask.io/">
            Metamask extension
          </a>
        </Typography>
      </Paper>
    );
  }

  // Check if Network has been started
  if (!isNetworkConnected) {
    return (
      <Paper>
        <Typography color="primary" variant="h2" align="center">
          Loading network
        </Typography>
      </Paper>
    );
  }

  if (
    metamaskNetwork
    !== PERMITTED_METAMASK_NETWORK
  ) {
    return (
      <Paper>
        <Typography color="primary" variant="h2" align="center">
          Please select
          {' '}
          {PERMITTED_METAMASK_NETWORK}
          {' '}
          network in Metamask extension
        </Typography>
        <p>
          selected:
          {' '}
          {metamaskNetwork}
        </p>
        <p>
          permitted:
          {' '}
          {PERMITTED_METAMASK_NETWORK}
        </p>

      </Paper>
    );
  }

  return (
    <main>
      <Nav />
      <Bridge />
      <ToastContainer autoClose={10000} />
    </main>
  );
}

export default BridgeApp;
