import { AnyAction, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import { bridgeHealthSlice } from "../reducers/bridgeHealth";
import * as BasicInboundChannel from '../../contracts/BasicInboundChannel.json';
import * as BasicOutboundChannel from '../../contracts/BasicOutboundChannel.json';
import * as BeefyLightClient from '../../contracts/BeefyLightClient.json';
import {
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS,
} from '../../config'
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import { Contract } from "web3-eth-contract";

export const startHealthCheckPoll = (web3: Web3 | undefined, polkadotApi: ApiPromise | undefined):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
  ): Promise<void> => {
    pollHealth(web3, polkadotApi, dispatch);
  }

export const pollHealth = async (web3: Web3 | undefined, polkadotApi: ApiPromise | undefined, dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
  const delay = (delay: number): Promise<void> => new Promise(r => setTimeout(r, delay));
  while (true) {
    try {
      await updateHealthCheck(web3, polkadotApi, dispatch);
      await delay(HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS);
    } catch(err) {
      console.error("Failed to get bridge health.", err);
      dispatch(bridgeHealthSlice.actions.setError("Bridge health unavailable."));
      break;
    }
  }
}

export const updateHealthCheck = async (web3: Web3 | undefined, polkadotApi: ApiPromise | undefined, dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {

  const ethInfo = await getLatestEthInfo(web3!);

  const basicOutboundChannelContract = new web3!.eth.Contract(
    BasicOutboundChannel.abi as any,
    BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  );
  const basicOutboundEth = await getEthMessageInfo(web3!, basicOutboundChannelContract, 'Message', ethInfo.latest_block);

  const basicInboundChannelContract = new web3!.eth.Contract(
    BasicInboundChannel.abi as any,
    BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  );
  const basicInboundEth = await getEthMessageInfo(web3!, basicInboundChannelContract, 'MessageDispatched', ethInfo.latest_block);
  const beefyContractAddress = await basicInboundChannelContract.methods.beefyLightClient().call();

  const ethBeefyInfo = await getLatestBeefyInfo(web3!, ethInfo.latest_block, beefyContractAddress);

  const polkadotFinalizedHash = await polkadotApi!.rpc.chain.getFinalizedHead();
  const polkadotFinalizedHeader = await polkadotApi!.rpc.chain.getHeader(polkadotFinalizedHash);
  const relaychainLatestBlock = polkadotFinalizedHeader.number.toNumber();

  const basicOutboundNonceKey = "0x29909c5f848a36dfe9c61eb048e04aab718368a0ace36e2b1b8b6dbd7f8093c0";
  const basicOutboundParachain = await getParachainMessageInfo(polkadotApi!, 'basicOutboundChannel', basicOutboundNonceKey);

  const basicInboundNonceKey = "0xc7e938b4500e324f906783aa6070fba7718368a0ace36e2b1b8b6dbd7f8093c0";
  const basicInboundParachain = await getParachainMessageInfo(polkadotApi!, 'basicInboundChannel', basicInboundNonceKey);
  const parachainEthInfo = await getParachainEthInfo(polkadotApi!);

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
      lastUpdated: ethInfo.date,
      lastUpdatedBestGuess: false,
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

const MaxBlocks = 1000;

const getEthMessageInfo = async (web3: Web3, contract: Contract, event: string, blockNumber: number) => {
  let startBlock = (blockNumber - MaxBlocks);
  if (startBlock < 0) startBlock = 0;
  const nonces = await contract.getPastEvents(event, { fromBlock: startBlock });
  if(nonces.length > 0) {
    const lastEvent = nonces[nonces.length-1];
    const blk = await web3.eth.getBlock(lastEvent.blockHash);
    return { nonce: Number(lastEvent.returnValues.nonce), date: new Date(Number(blk.timestamp)*1000), bestGuess: false };
  } else {
    const nonce = Number(await contract.methods.nonce().call());
    const blk = await web3.eth.getBlock(blockNumber);
    return { nonce, date: new Date(Number(blk.timestamp)*1000), bestGuess: true };
  }
};

const getParachainMessageInfo = async (polkadotApi: ApiPromise, channel: string, storageKey: string) => {
  const finalizedBlockHash = await polkadotApi.rpc.chain.getFinalizedHead();
  const finalizedBlockHeader = await polkadotApi.rpc.chain.getHeader(finalizedBlockHash);

  const startBlockNumber = finalizedBlockHeader.number.toNumber();
  let stopBlockNumber = finalizedBlockHeader.number.toNumber() - MaxBlocks;
  if (stopBlockNumber < 0) stopBlockNumber = 0;

  const nonce = Number(await polkadotApi.query[channel].nonce());

  let changeHash = await polkadotApi.rpc.chain.getBlockHash(startBlockNumber);
  let blockNumber = startBlockNumber-1;
  let bestGuess = true;

  while(blockNumber >= stopBlockNumber) {
    const blockHash = await polkadotApi.rpc.chain.getBlockHash(blockNumber);
    const blockNonceResult = await polkadotApi.rpc.state.queryStorageAt([storageKey], blockHash) as Array<any>;
    if(blockNonceResult.length > 0 && blockNonceResult[0].isSome) {
      const blockNonce = polkadotApi.registry.createType("u64", blockNonceResult[0].unwrap()).toNumber();
      if(blockNonce !== nonce) {
        bestGuess = false;
        break;
      }
    }
    changeHash = blockHash;
    blockNumber--;
  }

  const signedBlock = await polkadotApi.rpc.chain.getBlock(changeHash);
  const timestamp = signedBlock.block.extrinsics
    .map(ex => ex.toHuman() as any)
    .filter(ex => ex.method.method === 'set' && ex.method.section === 'timestamp')
    .map(ex => Number(String(ex.method.args[0]).replaceAll(',', '')));
  
  return { nonce, date: new Date(timestamp[0]), bestGuess };
}

const getLatestEthInfo = async (web3: Web3) => {
  const blockNumber = await web3!.eth.getBlockNumber();
  const blk = await web3.eth.getBlock(blockNumber);
  return { latest_block: blockNumber, date: new Date(Number(blk.timestamp)*1000) };
}

const getParachainEthInfo = async (polkadotApi: ApiPromise) => {
  const header: any = await polkadotApi.query.ethereumLightClient.finalizedBlock();
  return { block: Number(header.number), date: new Date(0) };
}

const getLatestBeefyInfo = async (web3: Web3, blockNumber: number, address: string) => {
  let startBlock = (blockNumber - MaxBlocks);
  if (startBlock < 0) startBlock = 0;

  const contract = new web3!.eth.Contract(
    BeefyLightClient.abi as any,
    address,
  );

  const initialVerifications = await contract.getPastEvents('InitialVerificationSuccessful', { fromBlock: startBlock });
  if(initialVerifications.length > 0) {
    const lastInitialVerification = initialVerifications[initialVerifications.length-1];
    const blk = await web3.eth.getBlock(lastInitialVerification.blockHash);
    return { block: Number(lastInitialVerification.returnValues.blockNumber), date: new Date(Number(blk.timestamp)*1000), bestGuess: false };
  }
  const blk = await web3.eth.getBlock(blockNumber);
  const latestBeefyBlock = Number(await contract.methods.latestBeefyBlock().call());
  return { block: latestBeefyBlock, date: new Date(Number(blk.timestamp)*1000), bestGuess: true };
}

const chooseDate = (a: Date, b: Date, isBestGuess: boolean) => {
  if(!isBestGuess) {
    // return best case: the most recent date.
    return a > b ? a : b;
  } else {
    // return worst case: the least recent date.
    return a > b ? b : a;
  }
}