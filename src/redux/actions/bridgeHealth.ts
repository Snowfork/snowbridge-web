import { AnyAction, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { bridgeHealthSlice } from "../reducers/bridgeHealth";
import * as BasicInboundChannel from '../../contracts/BasicInboundChannel.json';
import * as BasicOutboundChannel from '../../contracts/BasicOutboundChannel.json';
import * as IncentivizedInboundChannel from '../../contracts/IncentivizedInboundChannel.json';
import * as IncentivizedOutboundChannel from '../../contracts/IncentivizedOutboundChannel.json';
import {
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  INCENTIVIZED_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
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

    const update = {
      incentivizedOutboundEthNonce: await getEthNonce(web3!, IncentivizedOutboundChannel.abi, INCENTIVIZED_OUTBOUND_CHANNEL_CONTRACT_ADDRESS),
      incentivizedInboundEthNonce: await getEthNonce(web3!, IncentivizedInboundChannel.abi, INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS),
      incentivizedOutboundParachainNonce: await getParachainNonce(polkadotApi!, 'incentivizedOutboundChannel'),
      incentivizedInboundParachainNonce: await getParachainNonce(polkadotApi!, 'incentivizedInboundChannel'),

      basicOutboundEthNonce: await getEthNonce(web3!, BasicOutboundChannel.abi, BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS),
      basicInboundEthNonce: await getEthNonce(web3!, BasicInboundChannel.abi, BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS),

      basicOutboundParachainNonce: await getParachainNonce(polkadotApi!, 'basicOutboundChannel'),
      basicInboundParachainNonce: await getParachainNonce(polkadotApi!, 'basicInboundChannel'),

      relaychainLatestBlock: 0, // TODO: Need to pull in the relay chain address here
      ethLatestBeefyBlock: 0, // TODO: Need to pull in the beefy light client address and contract

      parachainLatestEthBlock: parachainFinalizedBlock,
      ethLatestBlock: ethFinalizedBlock,
    };
    console.log(update);

    const polkToEth = {
      blocks: {
        latency: update.relaychainLatestBlock - update.ethLatestBeefyBlock,
        lastUpdated: new Date(Date.now()),
      },
      messages: {
        unconfirmed: update.basicOutboundParachainNonce - update.basicInboundEthNonce,
        lastUpdated: new Date(Date.now()),
      },
    }

    const ethToPolk = {
      blocks: {
        latency: update.ethLatestBlock - update.parachainLatestEthBlock,
        lastUpdated: new Date(Date.now()),
      },
      messages: {
        unconfirmed: update.basicOutboundEthNonce - update.basicInboundParachainNonce,
        lastUpdated: new Date(Date.now()),
      }
    }

    dispatch(bridgeHealthSlice.actions.setPolkadotBlockHealth(polkToEth.blocks));
    dispatch(bridgeHealthSlice.actions.setPolkadotMessageHealth(polkToEth.messages));
    dispatch(bridgeHealthSlice.actions.setEthereumBlockHealth(ethToPolk.blocks));
    dispatch(bridgeHealthSlice.actions.setEthereumMessageHealth(ethToPolk.messages));
  };

const getParachainNonce = async (polkadotApi: ApiPromise, channel: string): Promise<number> => {
  const nonce = await polkadotApi.query[channel].nonce()
  return Number(nonce);
}

const getEthNonce = async (web3: Web3, abi: any, address: string): Promise<number> => {
  const basicChannelContract = new web3.eth.Contract(
    abi,
    address,
  );
  const nonce = await basicChannelContract.methods.nonce().call();
  return Number(nonce);
}