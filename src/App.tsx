import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Bridge from './components/Bridge/Bridge';
import Net from './net';

import 'react-toastify/dist/ReactToastify.css';

import { initializeTokens } from './redux/actions/bridge';
import { useAppSelector } from './utils/hooks';
import Layout from './components/Layout/Layout';
import FaqModal from './components/FaqModal/FaqModal';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

const BridgeApp = () => {
  const dispatch = useDispatch();
  const {
    isNetworkConnected,
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
      <div>
        <h2 style={{ color: 'white' }}>
          Please install the
          {' '}
          <a href="https://github.com/polkadot-js/extension">
            Polkadot.js extension
          </a>
        </h2>
      </div>
    );
  }

  if (metamaskMissing) {
    return (
      <div>
        <h2 style={{ color: 'white' }}>
          Please install the
          {' '}
          <a href="https://metamask.io/">
            Metamask extension
          </a>
        </h2>
      </div>
    );
  }

  // Check if Network has been started
  if (!isNetworkConnected) {
    return (
      <div>
        <h2 style={{ color: 'white' }}>
          Loading network
        </h2>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/">
            <Bridge />
          </Route>
        </Switch>
        <Route path="/faq">
          <FaqModal />
        </Route>
      </Layout>
      <ToastContainer autoClose={10000} />
    </Router>
  );
};

export default BridgeApp;
