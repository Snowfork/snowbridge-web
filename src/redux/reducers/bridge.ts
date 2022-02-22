/* eslint-disable no-param-reassign */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Asset, isDot, isEther } from '../../types/Asset';
import {
  NonFungibleTokenContract, OwnedNft, SwapDirection,
} from '../../types/types';
import { PARACHAIN_LIST } from '../../config';

export interface BridgeState {
  assets: Asset[],
  selectedAsset?: Asset,
  depositAmount: string,
  swapDirection: SwapDirection,
  showConfirmTransactionModal: boolean,
  showTransactionListModal: boolean,
  nonFungibleAssets: NonFungibleTokenContract[],
  ownedNonFungibleAssets: {
    polkadot: {
      [contractAddress: string]: OwnedNft[],
    },
    ethereum: {
      [contractAddress: string]: OwnedNft[],
    }
  },
  parachainId: number,
  transactionFee: number,
  fees: {
    erc20dot: string | null,
    parachainEth: string | null,
    error: string | null,
  },
}

const initialState: BridgeState = {
  assets: [],
  selectedAsset: undefined,
  depositAmount: '0',
  swapDirection: SwapDirection.EthereumToPolkadot,
  showConfirmTransactionModal: false,
  showTransactionListModal: false,
  nonFungibleAssets: [],
  ownedNonFungibleAssets: { polkadot: {}, ethereum: {} },
  parachainId: PARACHAIN_LIST ? PARACHAIN_LIST[0].parachainId : 0,
  transactionFee: PARACHAIN_LIST ? PARACHAIN_LIST[0].transactionFee : 0,
  fees: {
    erc20dot: null,
    parachainEth: null,
    error: null,
  },
};

// export default bridgeReducer;
export const bridgeSlice = createSlice({
  name: 'bridge',
  initialState,
  reducers: {
    _setTokenList:
      (state, action: PayloadAction<Asset[]>) => { state.assets = action.payload; },
    _setSelectedAsset:
      (state, action: PayloadAction<Asset | undefined>) => { state.selectedAsset = action.payload; },
    setDepositAmount:
      (state, action: PayloadAction<string>) => { state.depositAmount = action.payload; },
    setSwapDirection:
      (state, action: PayloadAction<SwapDirection>) => {
        state.swapDirection = action.payload;
      },
    setERC20DotFee:
      (state, action: PayloadAction<string>) => {
        state.fees.error = null;
        state.fees.erc20dot = action.payload;
      },
    setParachainEthFee:
      (state, action: PayloadAction<string>) => {
        state.fees.error = null;
        state.fees.parachainEth = action.payload;
      },    
    setFeeError:
      (state, action: PayloadAction<string>) => {
        state.fees.error = action.payload;
      },
    setParaChainId:
      (state, action: PayloadAction<number>) => {
        state.parachainId = action.payload;
      },
    setTransactionFee: 
      (state, action: PayloadAction<number>) => {
        state.transactionFee = action.payload;
      },
    setShowConfirmTransactionModal:
      (state, action: PayloadAction<boolean>) => {
        state.showConfirmTransactionModal = action.payload;
      },
    setShowTransactionListModal:
      (state, action: PayloadAction<boolean>) => { state.showTransactionListModal = action.payload; },
    setNonFungibleTokenList: (state, action: PayloadAction<NonFungibleTokenContract[]>) => {
      state.nonFungibleAssets = action.payload;
    },
    addOwnedEthereumNonFungibleAsset: (state, action: PayloadAction<OwnedNft[]>) => {
      action.payload.forEach((ownedNft) => {
        state.ownedNonFungibleAssets.ethereum[ownedNft.address] = action.payload;
      });
    },
    // this is called with the entire list of nfts for all contracts
    addOwnedPolkadotNonFungibleAssets: (state, action: PayloadAction<OwnedNft[]>) => {
      state.ownedNonFungibleAssets.polkadot = {};
      action.payload.forEach((ownedNft) => {
        const otherTokensForContract = state.ownedNonFungibleAssets.polkadot[ownedNft.address] || [];
        state.ownedNonFungibleAssets.polkadot[ownedNft.address] = otherTokensForContract.concat(ownedNft);
      });
    },
    resetOwnedNonFungibleAssets: (state) => {
      state.ownedNonFungibleAssets = {
        polkadot: {},
        ethereum: {},
      };
    },
  },
});

export default bridgeSlice.reducer;

// selectors
export const tokenBalancesByNetwork = (state: RootState): { sourceNetwork: string, destinationNetwork: string } => {
  let result = {
    sourceNetwork: state.bridge.selectedAsset?.balance.eth ?? '0',
    destinationNetwork: state.bridge.selectedAsset?.balance.polkadot ?? '0',
  };

  if (state.bridge.swapDirection === SwapDirection.PolkadotToEthereum) {
    result = {
      sourceNetwork: state.bridge.selectedAsset?.balance.polkadot ?? '0',
      destinationNetwork: state.bridge.selectedAsset?.balance.eth ?? '0',
    };
  }

  return result;
};

// return DOT asset from asset list
export const dotSelector = (state: RootState)
  : Asset => state.bridge.assets.filter((asset) => isDot(asset))[0];

// return Ether asset from asset list
export const etherSelector = (state: RootState)
  : Asset => state.bridge.assets.filter((asset) => isEther(asset))[0];
