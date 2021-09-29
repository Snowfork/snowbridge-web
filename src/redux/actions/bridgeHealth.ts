import { AnyAction, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { bridgeHealthSlice } from "../reducers/bridgeHealth";
import * as BasicInboundChannel from '../../contracts/BasicInboundChannel.json';
import * as BasicOutboundChannel from '../../contracts/BasicOutboundChannel.json';
import * as BeefyLightClient from '../../contracts/BeefyLightClient.json';
import {
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS,
  HEALTH_CHECK_POLL_MAX_BLOCKS,
} from '../../config'
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { Contract } from "web3-eth-contract";
import { SignedBlock } from '@polkadot/types/interfaces'

export const startHealthCheckPoll = (web3: Web3 | undefined, polkadotApi: ApiPromise | undefined, polkadotRelayApi: ApiPromise | undefined):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
  ): Promise<void> => {
    pollHealth(web3!, polkadotApi!, polkadotRelayApi!, dispatch);
  }

export const pollHealth = async (web3: Web3, polkadotApi: ApiPromise, polkadotRelayApi: ApiPromise, dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
  const delay = (delay: number): Promise<void> => new Promise(r => setTimeout(r, delay));
  while (true) {
    try {
      await updateHealthCheck(web3, polkadotApi, polkadotRelayApi, dispatch);
      await delay(HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS);
    } catch (err) {
      console.error("Failed to get bridge health.", err);
      dispatch(bridgeHealthSlice.actions.setError("Bridge health unavailable."));
      break;
    }
  }
}

export const updateHealthCheck = async (web3: Web3, polkadotApi: ApiPromise, polkadotRelayApi: ApiPromise, dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
  // BasicOutboundModule.Nonce
  const basicOutboundNonceKey = "0x29909c5f848a36dfe9c61eb048e04aab718368a0ace36e2b1b8b6dbd7f8093c0";
  // BasicInboundModule.Nonce
  const basicInboundNonceKey = "0xc7e938b4500e324f906783aa6070fba7718368a0ace36e2b1b8b6dbd7f8093c0";

  const basicInboundChannelContract = new web3.eth.Contract(
    BasicInboundChannel.abi as any,
    BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  );

  const basicOutboundChannelContract = new web3.eth.Contract(
    BasicOutboundChannel.abi as any,
    BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  );

  const ethInfoRequest = getLatestEthInfo(web3);
  const beefyContractAddressRequest = basicInboundChannelContract.methods.beefyLightClient().call();
  const parachainEthInfoRequest = getParachainEthInfo(polkadotApi);
  const basicOutboundParachainRequest = getParachainMessageInfo(polkadotApi, 'basicOutboundChannel', basicOutboundNonceKey);
  const basicInboundParachainRequest = getParachainMessageInfo(polkadotApi, 'basicInboundChannel', basicInboundNonceKey);

  const ethInfo = await ethInfoRequest;
  const beefyContractAddress = await beefyContractAddressRequest;

  const ethBeefyInfoRequest = getLatestBeefyInfo(web3, ethInfo.latest_block, beefyContractAddress);
  const basicOutboundEthRequest = getEthMessageInfo(web3, basicOutboundChannelContract, 'Message', ethInfo.latest_block);
  const basicInboundEthRequest = getEthMessageInfo(web3, basicInboundChannelContract, 'MessageDispatched', ethInfo.latest_block);
  const relaychainLatestBlockRequest = getLatestRelayChainInfo(polkadotRelayApi);

  const basicOutboundEth = await basicOutboundEthRequest;
  const basicInboundEth = await basicInboundEthRequest;
  const ethBeefyInfo = await ethBeefyInfoRequest;
  const basicOutboundParachain = await basicOutboundParachainRequest;
  const basicInboundParachain = await basicInboundParachainRequest;
  const parachainEthInfo = await parachainEthInfoRequest;
  const relaychainLatestBlock = await relaychainLatestBlockRequest;

  console.log("polk -> eth block", relaychainLatestBlock, ethBeefyInfo.block);
  console.log("polk -> eth message", basicOutboundParachain.nonce, basicInboundEth.nonce);

  console.log("eth -> polk block", ethInfo.latest_block, parachainEthInfo.block);
  console.log("eth -> polk message", basicOutboundEth.nonce, basicInboundParachain.nonce);

  const polkToEth = {
    blocks: {
      latency: relaychainLatestBlock - ethBeefyInfo.block,
      lastUpdated: ethBeefyInfo.date,
      lastUpdatedBestGuess: ethBeefyInfo.bestGuess,
    },
    messages: {
      unconfirmed: basicOutboundParachain.nonce - basicInboundEth.nonce,
      lastUpdated: chooseDate(basicInboundEth.date, basicOutboundParachain.date, basicInboundEth.bestGuess || basicOutboundParachain.bestGuess),
      lastUpdatedBestGuess: basicInboundEth.bestGuess || basicOutboundParachain.bestGuess,
    },
  }

  const ethToPolk = {
    blocks: {
      latency: ethInfo.latest_block - parachainEthInfo.block,
      lastUpdated: parachainEthInfo.date,
      lastUpdatedBestGuess: parachainEthInfo.bestGuess,
    },
    messages: {
      unconfirmed: basicOutboundEth.nonce - basicInboundParachain.nonce,
      lastUpdated: chooseDate(basicOutboundEth.date, basicInboundParachain.date, basicOutboundEth.bestGuess || basicInboundParachain.bestGuess),
      lastUpdatedBestGuess: basicOutboundEth.bestGuess || basicInboundParachain.bestGuess,
    }
  }

  dispatch(bridgeHealthSlice.actions.setPolkadotBlockHealth(polkToEth.blocks));
  dispatch(bridgeHealthSlice.actions.setPolkadotMessageHealth(polkToEth.messages));
  dispatch(bridgeHealthSlice.actions.setEthereumBlockHealth(ethToPolk.blocks));
  dispatch(bridgeHealthSlice.actions.setEthereumMessageHealth(ethToPolk.messages));
  dispatch(bridgeHealthSlice.actions.setLastUpdated(new Date(Date.now())));
  dispatch(bridgeHealthSlice.actions.setLoading(false));
};

const getEthMessageInfo = async (web3: Web3, contract: Contract, event: string, blockNumber: number) => {
  let startBlock = (blockNumber - HEALTH_CHECK_POLL_MAX_BLOCKS);
  if (startBlock < 0) startBlock = 0;

  const latestNonce = Number(await contract.methods.nonce().call());
  const prevNonceEvents = await contract.getPastEvents(event, { fromBlock: startBlock });
  
  let bestGuess = false;
  let timestamp = 0;
  if (prevNonceEvents.length > 0) {
    const lastEvent = prevNonceEvents[prevNonceEvents.length - 1];
    const blk = await web3.eth.getBlock(lastEvent.blockHash);
    timestamp = Number(blk.timestamp);
    bestGuess = false;
  } else {
    const blk = await web3.eth.getBlock(blockNumber);
    timestamp = Number(blk.timestamp);
    bestGuess = true;
  }

  return { nonce: latestNonce, date: new Date(timestamp * 1000), bestGuess };
};

const getParachainMessageInfo = async (polkadotApi: ApiPromise, channel: string, storageKey: string) => {
  const finalizedBlockHash = await polkadotApi.rpc.chain.getFinalizedHead();
  const finalizedBlockHeader = await polkadotApi.rpc.chain.getHeader(finalizedBlockHash);

  const startBlockNumber = finalizedBlockHeader.number.toNumber();
  let stopBlockNumber = finalizedBlockHeader.number.toNumber() - HEALTH_CHECK_POLL_MAX_BLOCKS;
  if (stopBlockNumber < 0) stopBlockNumber = 0;

  const nonce = Number(await polkadotApi.query[channel].nonce());

  let changeHash = await polkadotApi.rpc.chain.getBlockHash(startBlockNumber);
  let blockNumber = startBlockNumber - 1;
  let bestGuess = true;

  while (blockNumber >= stopBlockNumber) {
    const blockHash = await polkadotApi.rpc.chain.getBlockHash(blockNumber);
    const blockNonceResult = await polkadotApi.rpc.state.queryStorageAt([storageKey], blockHash) as Array<any>;
    if (blockNonceResult.length > 0 && blockNonceResult[0].isSome) {
      const blockNonce = polkadotApi.registry.createType("u64", blockNonceResult[0].unwrap()).toNumber();
      if (blockNonce !== nonce) {
        bestGuess = false;
        break;
      }
    }
    changeHash = blockHash;
    blockNumber -= 50;
  }

  const signedBlock = await polkadotApi.rpc.chain.getBlock(changeHash);
  const timestamp = getTimestampFromParachainBlock(signedBlock);
  return { nonce, date: timestamp, bestGuess };
}

const getLatestEthInfo = async (web3: Web3) => {
  const blockNumber = await web3.eth.getBlockNumber();
  return { latest_block: blockNumber };
}

const getLatestRelayChainInfo = async (polkadotRelayApi: ApiPromise) => {
  const relayChainFinalizedHash = await polkadotRelayApi.rpc.chain.getFinalizedHead();
  const relayChainFinalizedHead = await polkadotRelayApi.rpc.chain.getHeader(relayChainFinalizedHash);
  return relayChainFinalizedHead.number.toNumber();
}

const getParachainEthInfo = async (polkadotApi: ApiPromise) => {
  const finalizedBlockHash = await polkadotApi.rpc.chain.getFinalizedHead();
  const finalizedBlockHeader = await polkadotApi.rpc.chain.getHeader(finalizedBlockHash);

  const startBlockNumber = finalizedBlockHeader.number.toNumber();
  let stopBlockNumber = finalizedBlockHeader.number.toNumber() - HEALTH_CHECK_POLL_MAX_BLOCKS;
  if (stopBlockNumber < 0) stopBlockNumber = 0;

  const header: any = await polkadotApi.query.ethereumLightClient.finalizedBlock();
  const ethBlockNumber = Number(header.number);

  let changeHash = await polkadotApi.rpc.chain.getBlockHash(startBlockNumber);
  let blockNumber = startBlockNumber - 1;
  let bestGuess = true;

  const storageKey = "0xb76dae0be628ba37edd6eda726135ecc03675448006f828e6b077873c49b9733";

  while (blockNumber >= stopBlockNumber) {
    const blockHash = await polkadotApi.rpc.chain.getBlockHash(blockNumber);
    const blockNonceResult = await polkadotApi.rpc.state.queryStorageAt([storageKey], blockHash) as Array<any>;
    if (blockNonceResult.length > 0 && blockNonceResult[0].isSome) {
      const ethereumHeader = polkadotApi.registry.createType('EthereumHeaderId' as any, blockNonceResult[0].unwrap());
      if (Number(ethereumHeader.number) !== ethBlockNumber) {
        bestGuess = false;
        break;
      }
    }
    changeHash = blockHash;
    blockNumber -= 50;
  }

  const signedBlock = await polkadotApi.rpc.chain.getBlock(changeHash);
  const timestamp = getTimestampFromParachainBlock(signedBlock)
  return { block: ethBlockNumber, date: timestamp, bestGuess };
}

const getLatestBeefyInfo = async (web3: Web3, blockNumber: number, address: string) => {
  let startBlock = (blockNumber - HEALTH_CHECK_POLL_MAX_BLOCKS);
  if (startBlock < 0) startBlock = 0;

  const contract = new web3!.eth.Contract(
    BeefyLightClient.abi as any,
    address,
  );

  const latestBeefyBlock = Number(await contract.methods.latestBeefyBlock().call());

  const events = await contract.getPastEvents("FinalVerificationSuccessful", { fromBlock: startBlock });
  if (events.length > 0) {
    const lastEvent = events[events.length - 1];
    const blk = await web3.eth.getBlock(lastEvent.blockHash);
    return { block: latestBeefyBlock, date: new Date(Number(blk.timestamp) * 1000), bestGuess: false };
  }

  const blk = await web3.eth.getBlock(startBlock);
  return { block: latestBeefyBlock, date: new Date(Number(blk.timestamp) * 1000), bestGuess: true };
}

const getTimestampFromParachainBlock = (signedBlock: SignedBlock) => {
  const timestamp = signedBlock.block.extrinsics
    .map(ex => ex.toHuman() as any)
    .filter(ex => ex.method.method === 'set' && ex.method.section === 'timestamp')
    .map(ex => Number(String(ex.method.args[0]).replaceAll(',', '')));

  return new Date(timestamp[0]);
}

const chooseDate = (a: Date, b: Date, isBestGuess: boolean) => {
  if (!isBestGuess) {
    // return best case: the most recent date.
    return a > b ? a : b;
  } else {
    // return worst case: the least recent date.
    return a > b ? b : a;
  }
}