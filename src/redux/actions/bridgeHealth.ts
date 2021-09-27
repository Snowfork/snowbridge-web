import { AnyAction, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { bridgeHealthSlice } from "../reducers/bridgeHealth";
import * as BasicInboundChannel from '../../contracts/BasicInboundChannel.json';
import * as BasicOutboundChannel from '../../contracts/BasicOutboundChannel.json';
import * as BeefyLightClient from '../../contracts/BeefyLightClient.json';
import {
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
} from '../../config'
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";

export const updateHealthCheck = (web3: Web3 | undefined, polkadotApi: ApiPromise | undefined):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
  ): Promise<void> => {

    const parachainEthHeader: any = await polkadotApi!.query.ethereumLightClient.finalizedBlock();
    const parachainFinalizedBlock = Number(parachainEthHeader.number);
    const ethFinalizedBlock = await web3!.eth.getBlockNumber();

    const basicOutboundChannelContract = new web3!.eth.Contract(
      BasicOutboundChannel.abi as any,
      BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
    );
    const basicOutboundEthNonce = Number(await basicOutboundChannelContract.methods.nonce().call());

    const basicInboundChannelContract = new web3!.eth.Contract(
      BasicInboundChannel.abi as any,
      BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
    );
    const basicInboundEthNonce = Number(await basicInboundChannelContract.methods.nonce().call());
    const beefyContractAddress = await basicInboundChannelContract.methods.beefyLightClient().call();

    const basicOutboundParachainNonce = Number(await polkadotApi!.query.basicOutboundChannel.nonce())
    const basicInboundParachainNonce = Number(await polkadotApi!.query.basicInboundChannel.nonce())

    const beefyLightClient = new web3!.eth.Contract(
      BeefyLightClient.abi as any,
      beefyContractAddress,
    );
    const ethLatestBeefyBlock = Number(await beefyLightClient.methods.latestBeefyBlock().call());
    
    const relaychainLatestBlock = 0; // TODO: Need to pull in the relay chain address here

    const parachainLatestEthBlock = parachainFinalizedBlock;
    const ethLatestBlock = ethFinalizedBlock;

    const polkToEth = {
      blocks: {
        latency: relaychainLatestBlock - ethLatestBeefyBlock,
        lastUpdated: new Date(Date.now()),
      },
      messages: {
        unconfirmed: basicOutboundParachainNonce - basicInboundEthNonce,
        lastUpdated: new Date(Date.now()),
      },
    }

    const ethToPolk = {
      blocks: {
        latency: ethLatestBlock - parachainLatestEthBlock,
        lastUpdated: new Date(Date.now()),
      },
      messages: {
        unconfirmed: basicOutboundEthNonce - basicInboundParachainNonce,
        lastUpdated: new Date(Date.now()),
      }
    }

    dispatch(bridgeHealthSlice.actions.setPolkadotBlockHealth(polkToEth.blocks));
    dispatch(bridgeHealthSlice.actions.setPolkadotMessageHealth(polkToEth.messages));
    dispatch(bridgeHealthSlice.actions.setEthereumBlockHealth(ethToPolk.blocks));
    dispatch(bridgeHealthSlice.actions.setEthereumMessageHealth(ethToPolk.messages));
  };
