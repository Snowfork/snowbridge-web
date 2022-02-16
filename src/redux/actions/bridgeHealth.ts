import { AnyAction, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { bridgeHealthSlice } from "../reducers/bridgeHealth";
import * as BasicInboundChannel from '../../contracts/BasicInboundChannel.json';
import * as BasicOutboundChannel from '../../contracts/BasicOutboundChannel.json';
import * as IncentivizedInboundChannel from '../../contracts/IncentivizedInboundChannel.json';
import * as IncentivizedOutboundChannel from '../../contracts/IncentivizedOutboundChannel.json';
import * as BeefyLightClient from '../../contracts/BeefyLightClient.json';
import {
  ACTIVE_CHANNEL,
  CONTRACT_ADDRESS,
  HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS,
  HEALTH_CHECK_ETHEREUM_POLL_MAX_BLOCKS,
  HEALTH_CHECK_POLKADOT_POLL_MAX_BLOCKS,
  HEALTH_CHECK_POLKADOT_POLL_SKIP_BLOCKS,
} from '../../config'
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { Contract } from "web3-eth-contract";
import { SignedBlock } from '@polkadot/types/interfaces'
import { RootState } from "../store";
import { Channel } from "../../types/types";

interface NonceInfo {
  nonce: number,
  date: Date,
  bestGuess: boolean
}

interface ChannelInfo {
  beefyContractAddress: any,
  eth: {
    outbound: NonceInfo,
    inbound: NonceInfo,
  },
  parachain: {
    outbound: NonceInfo,
    inbound: NonceInfo,
  }
}

interface BlockInfo {
  block: number,
  date: Date,
  bestGuess: boolean
}

export const startHealthCheckPoll = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
  ): Promise<void> => {
    const { net: { web3, polkadotApi, polkadotRelayApi } } = getState() as RootState;
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

  const parachainEthInfoRequest = parachainEthInfo(polkadotApi);

  const latestEthBlock = await latestEthInfo(web3);;

  let channel: ChannelInfo;
  switch (ACTIVE_CHANNEL) {
    case Channel.INCENTIVIZED:
      channel = await incentivizedChannelInfo(web3, polkadotApi, latestEthBlock);
      break;
    case Channel.BASIC:
      channel = await basicChannelInfo(web3, polkadotApi, latestEthBlock);
      break;
    default:
      throw new Error(ACTIVE_CHANNEL + ' unsupported.');
  }

  const ethBeefyInfoRequest = latestBeefyInfo(web3, latestEthBlock, channel.beefyContractAddress);
  const relaychainLatestBlockRequest = latestRelayChainInfo(polkadotRelayApi);

  const ethBeefyInfo = await ethBeefyInfoRequest;
  const parachainEth = await parachainEthInfoRequest;
  const relaychainLatestBlock = await relaychainLatestBlockRequest;

  const polkToEth = {
    blocks: {
      latency: relaychainLatestBlock - ethBeefyInfo.block,
      lastUpdated: ethBeefyInfo.date,
      lastUpdatedBestGuess: ethBeefyInfo.bestGuess,
    },
    messages: {
      unconfirmed: channel.parachain.outbound.nonce - channel.eth.inbound.nonce,
      lastUpdated: chooseDate(channel.eth.inbound.date, channel.parachain.outbound.date, channel.eth.inbound.bestGuess || channel.parachain.outbound.bestGuess),
      lastUpdatedBestGuess: channel.eth.inbound.bestGuess || channel.parachain.outbound.bestGuess,
    },
  }

  const ethToPolk = {
    blocks: {
      latency: latestEthBlock - parachainEth.block,
      lastUpdated: parachainEth.date,
      lastUpdatedBestGuess: parachainEth.bestGuess,
    },
    messages: {
      unconfirmed: channel.eth.outbound.nonce - channel.parachain.inbound.nonce,
      lastUpdated: chooseDate(channel.eth.outbound.date, channel.parachain.inbound.date, channel.eth.outbound.bestGuess || channel.parachain.inbound.bestGuess),
      lastUpdatedBestGuess: channel.eth.outbound.bestGuess || channel.parachain.inbound.bestGuess,
    }
  }

  dispatch(bridgeHealthSlice.actions.setPolkadotBlockHealth(polkToEth.blocks));
  dispatch(bridgeHealthSlice.actions.setPolkadotMessageHealth(polkToEth.messages));
  dispatch(bridgeHealthSlice.actions.setEthereumBlockHealth(ethToPolk.blocks));
  dispatch(bridgeHealthSlice.actions.setEthereumMessageHealth(ethToPolk.messages));
  dispatch(bridgeHealthSlice.actions.setLastUpdated(new Date(Date.now())));
  dispatch(bridgeHealthSlice.actions.setLoading(false));
};

const basicChannelInfo = async (web3: Web3, polkadotApi: ApiPromise, latestEthBlock: number): Promise<ChannelInfo> => {
  // BasicOutboundModule.Nonce
  const outboundNonceKey = "0x29909c5f848a36dfe9c61eb048e04aab718368a0ace36e2b1b8b6dbd7f8093c0";
  // BasicInboundModule.Nonce
  const inboundNonceKey = "0xc7e938b4500e324f906783aa6070fba7718368a0ace36e2b1b8b6dbd7f8093c0";

  const outboundParachainRequest = parachainMessageInfo(polkadotApi, 'basicOutboundChannel', outboundNonceKey);
  const inboundParachainRequest = parachainMessageInfo(polkadotApi, 'basicInboundChannel', inboundNonceKey);

  const inboundContract = new web3.eth.Contract(
    BasicInboundChannel.abi as any,
    CONTRACT_ADDRESS.BasicInboundChannel,
  );

  const outboundContract = new web3.eth.Contract(
    BasicOutboundChannel.abi as any,
    CONTRACT_ADDRESS.BasicOutboundChannel,
  );

  const beefyContractAddressRequest = inboundContract.methods.beefyLightClient().call();

  const outboundEthRequest = ethMessageInfo(web3, outboundContract, 'Message', latestEthBlock);
  const inboundEthRequest = ethMessageInfo(web3, inboundContract, 'MessageDispatched', latestEthBlock);

  return {
    beefyContractAddress: await beefyContractAddressRequest,
    eth: {
      outbound: await outboundEthRequest,
      inbound: await inboundEthRequest,
    },
    parachain: {
      outbound: await outboundParachainRequest,
      inbound: await inboundParachainRequest,
    }
  };
}

const incentivizedChannelInfo = async (web3: Web3, polkadotApi: ApiPromise, latestEthBlock: number): Promise<ChannelInfo> => {
  // IncentivizedOutboundModule.Nonce
  const outboundNonceKey = "0x39798c8f0b76c22294af6323916bf4b5718368a0ace36e2b1b8b6dbd7f8093c0";
  // IncentivizedInboundModule.Nonce
  const inboundNonceKey = "0xe760fc5f1bca23a76b7f552958a49a5c718368a0ace36e2b1b8b6dbd7f8093c0";

  const outboundParachainRequest = parachainMessageInfo(polkadotApi, 'incentivizedOutboundChannel', outboundNonceKey);
  const inboundParachainRequest = parachainMessageInfo(polkadotApi, 'incentivizedInboundChannel', inboundNonceKey);

  const inboundContract = new web3.eth.Contract(
    IncentivizedInboundChannel.abi as any,
    CONTRACT_ADDRESS.IncentivizedInboundChannel,
  );

  const outboundContract = new web3.eth.Contract(
    IncentivizedOutboundChannel.abi as any,
    CONTRACT_ADDRESS.IncentivizedOutboundChannel,
  );

  const beefyContractAddressRequest = inboundContract.methods.beefyLightClient().call();

  const outboundEthRequest = ethMessageInfo(web3, outboundContract, 'Message', latestEthBlock);
  const inboundEthRequest = ethMessageInfo(web3, inboundContract, 'MessageDispatched', latestEthBlock);

  return {
    beefyContractAddress: await beefyContractAddressRequest,
    eth: {
      outbound: await outboundEthRequest,
      inbound: await inboundEthRequest,
    },
    parachain: {
      outbound: await outboundParachainRequest,
      inbound: await inboundParachainRequest,
    }
  };
}

const parachainMessageInfo = async (polkadotApi: ApiPromise, channel: string, storageKey: string): Promise<NonceInfo> => {
  const finalizedBlockHash = await polkadotApi.rpc.chain.getFinalizedHead();
  const finalizedBlockHeader = await polkadotApi.rpc.chain.getHeader(finalizedBlockHash);

  const startBlockNumber = finalizedBlockHeader.number.toNumber();
  let stopBlockNumber = finalizedBlockHeader.number.toNumber() - HEALTH_CHECK_POLKADOT_POLL_MAX_BLOCKS;
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
    blockNumber -= HEALTH_CHECK_POLKADOT_POLL_SKIP_BLOCKS;
  }

  const signedBlock = await polkadotApi.rpc.chain.getBlock(changeHash);
  const timestamp = dateFromParachainBlock(signedBlock);
  return { nonce, date: timestamp, bestGuess };
}

const ethMessageInfo = async (web3: Web3, contract: Contract, event: string, blockNumber: number): Promise<NonceInfo> => {
  let startBlock = (blockNumber - HEALTH_CHECK_ETHEREUM_POLL_MAX_BLOCKS);
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

const latestRelayChainInfo = async (polkadotRelayApi: ApiPromise): Promise<number> => {
  const relayChainFinalizedHash = await polkadotRelayApi.rpc.chain.getFinalizedHead();
  const relayChainFinalizedHead = await polkadotRelayApi.rpc.chain.getHeader(relayChainFinalizedHash);
  return relayChainFinalizedHead.number.toNumber();
}

const latestEthInfo = async (web3: Web3): Promise<number> => {
  const blockNumber = await web3.eth.getBlockNumber();
  return blockNumber;
}

const parachainEthInfo = async (polkadotApi: ApiPromise): Promise<BlockInfo> => {
  const finalizedBlockHash = await polkadotApi.rpc.chain.getFinalizedHead();
  const finalizedBlockHeader = await polkadotApi.rpc.chain.getHeader(finalizedBlockHash);

  const startBlockNumber = finalizedBlockHeader.number.toNumber();
  let stopBlockNumber = finalizedBlockHeader.number.toNumber() - HEALTH_CHECK_POLKADOT_POLL_MAX_BLOCKS;
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
    blockNumber -= HEALTH_CHECK_POLKADOT_POLL_SKIP_BLOCKS;
  }

  const signedBlock = await polkadotApi.rpc.chain.getBlock(changeHash);
  const timestamp = dateFromParachainBlock(signedBlock)
  return { block: ethBlockNumber, date: timestamp, bestGuess };
}

const latestBeefyInfo = async (web3: Web3, blockNumber: number, address: string): Promise<BlockInfo> => {
  let startBlock = (blockNumber - HEALTH_CHECK_ETHEREUM_POLL_MAX_BLOCKS);
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

const dateFromParachainBlock = (signedBlock: SignedBlock): Date => {
  const timestamp = signedBlock.block.extrinsics
    .map(ex => ex.toHuman() as any)
    .filter(ex => ex.method.method === 'set' && ex.method.section === 'timestamp')
    .map(ex => Number(String(ex.method.args[0]).replaceAll(',', '')));

  return new Date(timestamp[0]);
}

const chooseDate = (a: Date, b: Date, isBestGuess: boolean): Date => {
  if (!isBestGuess) {
    // return best case: the most recent date.
    return a > b ? a : b;
  } else {
    // return worst case: the least recent date.
    return a > b ? b : a;
  }
}