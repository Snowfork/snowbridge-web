// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, {useState, useEffect} from 'react';
import Web3 from 'web3';

// local imports and components
import Bridge from './Bridge';

type MyWindow = (typeof window) & {
  ethereum: any;
  web3: Web3;
}

function BridgeApp () {
  const [web3Enabled, enableWeb3] = useState(false);

  // Connect to Web3
  useEffect ( () => {
    let locWindow = (window as MyWindow);

    if (locWindow.ethereum) {
      locWindow.web3 = new Web3(locWindow.ethereum);
      locWindow.ethereum.enable();
      enableWeb3(true);
    }  

  }, []);

  if(!web3Enabled) {
    return <p style={{textAlign: 'center'}}>Please install MetaMask to use this application!</p>
  }

  return (
      <main>
        <Bridge web3={(window as MyWindow).web3}/>
      </main>
  );
}

export default BridgeApp;
