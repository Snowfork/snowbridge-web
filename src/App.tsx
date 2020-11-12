// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, {useState, useEffect} from "react";
import Web3 from "web3";
import {ApiPromise, WsProvider} from "@polkadot/api";

// local imports and components
import Bridge from "./Bridge";
import Nav from "./Nav";
import {POLKADOT_API_PROVIDER} from "./config";

type MyWindow = typeof window & {
  ethereum: any;
  web3: Web3;
};

function BridgeApp() {
  const [web3Enabled, enableWeb3] = useState(false);
  const [polkadotEnabled, enablePolkadotApi] = useState<
    null | ApiPromise | "loading"
  >("loading");

  // Connect to Web3
  useEffect(() => {
    let locWindow = window as MyWindow;

    if (locWindow.ethereum) {
      locWindow.web3 = new Web3(locWindow.ethereum);
      locWindow.ethereum.enable();
      enableWeb3(true);
    }
  }, []);

  // Connect to Polkadotjs
  useEffect(() => {
    let exe = async () => {
      const wsProvider = new WsProvider(POLKADOT_API_PROVIDER);

      try {
        const api = await ApiPromise.create({
          provider: wsProvider,
          types: {
            Address: "AccountId",
            LookupSource: "AccountId",
            AppId: "[u8; 20]",
            Message: {
              payload: "Vec<u8>",
              verification: "VerificationInput",
            },
            VerificationInput: {
              _enum: {
                Basic: "VerificationBasic",
                None: null,
              },
            },
            VerificationBasic: {
              blockNumber: "u64",
              eventIndex: "u32",
            },
            TokenId: "H160",
            BridgedAssetId: "H160",
            AssetAccountData: {
              free: "U256",
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

  if (!web3Enabled) {
    return (
      <p style={{textAlign: "center"}}>
        Please install MetaMask to use this application!
      </p>
    );
  }

  if (!polkadotEnabled) {
    return (
      <p style={{textAlign: "center"}}>
        Something went wrong while connecting the Polkadotjs API.
      </p>
    );
  } else if (polkadotEnabled === "loading") {
    return <p style={{textAlign: "center"}}>Connecting Polkadotjs API...</p>;
  }

  return (
    <main>
      <Nav web3={(window as MyWindow).web3} polkadotApi={polkadotEnabled} />
      <Bridge web3={(window as MyWindow).web3} />
    </main>
  );
}

export default BridgeApp;
