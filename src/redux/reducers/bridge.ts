/* eslint-disable no-param-reassign */
import BigNumber from 'bignumber.js';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Asset, isDot, isEther } from '../../types/Asset';
import { NonFungibleTokenContract, OwnedNft, SwapDirection } from '../../types/types';

export interface BridgeState {
  assets: Asset[],
  selectedAsset?: Asset
  depositAmount: string,
  swapDirection: SwapDirection,
  showConfirmTransactionModal: boolean,
  showTransactionsList: boolean,
  nonFungibleAssets: NonFungibleTokenContract[],
  ownedNonFungibleAssets: { [contractAddress: string]: OwnedNft[]}
}

const initialState: BridgeState = {
  assets: [],
  selectedAsset: undefined,
  depositAmount: '0.0',
  swapDirection: SwapDirection.EthereumToPolkadot,
  showConfirmTransactionModal: false,
  showTransactionsList: false,
  nonFungibleAssets: [],
  ownedNonFungibleAssets: {},
};

// export default bridgeReducer;
export const bridgeSlice = createSlice({
  name: 'bridge',
  initialState,
  reducers: {
    _setTokenList:
      (state, action: PayloadAction<Asset[]>) => { state.assets = action.payload; },
    _setSelectedAsset:
      (state, action: PayloadAction<Asset>) => { state.selectedAsset = action.payload; },
    setDepositAmount:
     (state, action: PayloadAction<string>) => { state.depositAmount = action.payload; },
    setSwapDirection:
     (state, action: PayloadAction<SwapDirection>) => {
       state.swapDirection = action.payload;
     },
    setShowConfirmTransactionModal:
     (state, action: PayloadAction<boolean>) => {
       state.showConfirmTransactionModal = action.payload;
     },
    setShowTransactionList:
     (state, action: PayloadAction<boolean>) => { state.showTransactionsList = action.payload; },
    setNonFungibleTokenList: (state, action: PayloadAction<NonFungibleTokenContract[]>) => {
      state.nonFungibleAssets = action.payload;
    },
    addOwnedNonFungibleAsset: (state, action: PayloadAction<OwnedNft[]>) => {
      action.payload.forEach((ownedNft) => {
        state
          .ownedNonFungibleAssets[ownedNft.address as any] = action.payload;
      });
    },
    resetOwnedNonFungibleAssets: (state) => {
      state.ownedNonFungibleAssets = {};
    },
  },
});

export default bridgeSlice.reducer;

// selectors
export const tokenBalancesByNetwork = (state: RootState):
 {sourceNetwork: string, destinationNetwork: string} => {
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

// asset value in usd
export const tokenSwapUsdValueSelector = (state: RootState)
: string => new BigNumber(state.bridge.selectedAsset?.prices.usd ?? 0)
  .multipliedBy(state.bridge.depositAmount)
  .toString();

// return DOT asset from asset list
export const dotSelector = (state: RootState)
: Asset => state.bridge.assets.filter((asset) => isDot(asset))[0];

// return Ether asset from asset list
export const etherSelector = (state: RootState)
: Asset => state.bridge.assets.filter((asset) => isEther(asset))[0];
