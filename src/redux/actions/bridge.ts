/* eslint-disable @typescript-eslint/ban-types */
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Chain, NonFungibleTokenContract, Token } from '../../types/types';
import { RootState } from '../store';
import * as ERC20 from '../../contracts/ERC20.json';
import * as WrappedToken from '../../contracts/WrappedToken.json';
import { getAssetPrice } from '../../net/api';
import EthApi from '../../net/eth';
import Polkadot from '../../net/polkadot';
import * as Erc721Api from '../../net/ERC721';
import { fetchERC20Allowance } from './ERC20Transactions';
import { Asset, createAsset } from '../../types/Asset';
import Erc20TokenList from '../../assets/tokens/Erc20Tokens';
import DotTokenList from '../../assets/tokens/DotTokens';
import EthTokenList from '../../assets/tokens/EthTokens';
import Erc721TokenList from '../../assets/tokens/Erc721Tokens';
import ERC721Contract from '../../contracts/TestToken721.json';
import { dotSelector, etherSelector, bridgeSlice } from '../reducers/bridge';

export const {
  _setTokenList,
  _setSelectedAsset,
  setDepositAmount,
  setShowConfirmTransactionModal,
  setShowTransactionList,
  setSwapDirection,
  setNonFungibleTokenList,
  addOwnedNonFungibleAsset,
  resetOwnedNonFungibleAssets,
} = bridgeSlice.actions;

// async middleware actions
// sets selected asset and updates ERC20 spend allowance
export const updateSelectedAsset = (asset: Asset):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  // upate selected asset

  dispatch(bridgeSlice.actions._setSelectedAsset(asset));

  // update erc spending allowance
  dispatch(fetchERC20Allowance());
};

// this takes the token data input and writes it to the token list
// this will also update the selected asset if needed
export const updateTokenData = (asset: Asset):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { assets, selectedAsset } = state.bridge;

  // update token data in token list
  const updatedTokens = assets?.map((_asset: Asset) => {
    if (asset.address === _asset.address) {
      return {
        ..._asset,
        ...asset,
      };
    }

    return _asset;
  });
  dispatch(bridgeSlice.actions._setTokenList(updatedTokens as Asset[]));

  // update token data in selected asset
  if (selectedAsset?.address === asset.address) {
    const updatedAsset = { ...selectedAsset, ...asset };
    dispatch(updateSelectedAsset(updatedAsset as Asset));
  }
};

// update gas balances
export const updateGasBalances = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;

  // update polkadot gas balance
  const dot = dotSelector(state);
  const { polkadotApi, polkadotAddress } = state.net;

  if (dot && polkadotApi && polkadotAddress) {
    const balance = await Polkadot.getGasCurrencyBalance(polkadotApi, polkadotAddress);
    const newDotData = {
      ...dot,
      balance: {
        ...dot.balance,
        polkadot: balance,
      },
    };
    dispatch(updateTokenData(newDotData as Asset));
  }

  // update ethereum gas balance
  const ether = etherSelector(state);
  const { web3, ethAddress } = state.net;
  if (ether && web3 && ethAddress) {
    const etherBalance = await EthApi.getTokenBalance(web3, ethAddress, ether);
    const newEtherData = {
      ...ether,
      balance: {
        ...ether.balance,
        eth: etherBalance,
      },
    };
    dispatch(updateTokenData(newEtherData as Asset));
  }
};

// update balances for selected asset
// updates values for selected asset as well as
// the matching asset in the asset list
// this will also update the gas balances
export const updateBalances = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { selectedAsset } = state.bridge;
  const {
    web3,
    ethAddress,
    polkadotApi,
    polkadotAddress,
  } = state.net;

  if (selectedAsset) {
    // fetch updated balances
    const ethBalance = await EthApi.getTokenBalance(web3!, ethAddress!, selectedAsset);
    const polkadotBalance = await Polkadot.getAssetBalance(
        polkadotApi!,
        polkadotAddress!,
        selectedAsset,
    );

    const updatedTokenData = {
      ...selectedAsset,
      balance: {
        eth: ethBalance,
        polkadot: polkadotBalance,
      },
    };
    dispatch(updateTokenData(updatedTokenData as Asset));
  }

  dispatch(updateGasBalances());
};

// use the token list to instantiate contract instances
// and store them in redux. We also query the balance to use later
export const initializeTokens = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { ethAddress, polkadotApi, polkadotAddress } = state.net;

  const tokens = Erc20TokenList;

  if (state.net.web3?.currentProvider) {
    const web3 = state!.net.web3!;
    // only include tokens from  current network
    const networkFilter = (token: Token) => token.chainId
        === Number.parseInt((web3.currentProvider as any).chainId, 16);

    const erc20TokenListFiltered = tokens.filter(
      networkFilter,
    );
    const dotTokenListFiltered = DotTokenList.filter(networkFilter);
    const ethTokenListFiltered = EthTokenList.filter(networkFilter);

    let assetList: Asset[] = [];

    // append Ether
    const ethAssets: Asset[] = ethTokenListFiltered.map((token: Token) => createAsset(
      token,
      Chain.ETHEREUM,
      18,
      undefined,
    ));
    assetList = assetList.concat(ethAssets);

    // append erc20 tokens
    const erc20Assets: Asset[] = erc20TokenListFiltered.map(
      (token: Token) => {
        // eth 'tokens' don't have any contract instance
        let contractInstance;

        // All valid contract addresses have 42 characters ('0x' + address)
        if (token.address.length === 42) {
          //   create token contract instance
          contractInstance = new web3.eth.Contract(
              ERC20.abi as any,
              token.address,
          );
        }

        return createAsset(token, Chain.ETHEREUM, token.decimals, contractInstance);
      },
    );
    assetList = assetList.concat(erc20Assets);

    // append DOT
    const dotAssets = dotTokenListFiltered
      .map(
        (dotToken: Token) => createAsset(
          dotToken,
          Chain.POLKADOT,
          18,
          new web3.eth.Contract(WrappedToken.abi as any, dotToken.address),
        ),
      );
    assetList = assetList.concat(dotAssets);

    // ERC721 tokens
    const nftAssets = Erc721TokenList
      .filter(
        (nft) => nft.chainId === Number.parseInt((web3.currentProvider as any).chainId, 16),
      )
      .map((token): NonFungibleTokenContract => ({
        name: token.name,
        symbol: token.symbol,
        chainId: token.chainId,
        address: token.address,
        contract: new web3.eth.Contract(ERC721Contract.abi as any, token.address),
      }));

    dispatch(setNonFungibleTokenList(nftAssets));

    // store the token list
    dispatch(_setTokenList(assetList));
    // set default selected token to first token from list
    dispatch(updateSelectedAsset(assetList[0]));

    // now that the token list has loaded we can
    // loop through the list and for each fetch the
    // price, balance on eth and balance on substrate
    // and asynchronously update the token list as we get each result

    assetList.map(async (asset: Asset) => {
      let newTokenData = asset;

      // fetch token balances on substrate
      try {
        const polkadotBalance = await Polkadot.getAssetBalance(
            polkadotApi!,
            polkadotAddress!,
            asset,
        );

        newTokenData = {
          ...newTokenData,
          balance: {
            ...newTokenData.balance,
            polkadot: polkadotBalance,
          },
        };
        dispatch(updateTokenData(newTokenData));
      } catch (e) {
        console.log('failed reading polkadot balance', e);
      }
      // fetch token balances on ethereum
      try {
        const ethBalance = await EthApi.getTokenBalance(
          web3,
            ethAddress!,
            asset,
        );

        newTokenData = {
          ...newTokenData,
          balance: {
            ...newTokenData.balance,
            eth: ethBalance,
          },
        };
        dispatch(updateTokenData(newTokenData));
      } catch (e) {
        console.log('failed reading eth balance', e);
      }

      try {
        // fetch token price from coin gecko
        const priceResult = await getAssetPrice(asset);

        let prices = { ...newTokenData.prices };
        prices = { ...prices, ...priceResult };

        // update price in state
        newTokenData.prices = prices;
        dispatch(updateTokenData(newTokenData));
      } catch (e) {
        console.log('error fetching price', e);
      }
    });
  }
};

export const fetchOwnedNonFungibleAssets = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;

  // clear out old data
  dispatch(resetOwnedNonFungibleAssets());

  const {
    bridge: {
      nonFungibleAssets,
    },
    net: {
      ethAddress,
    },
  } = state;

  nonFungibleAssets.map(
    async (nft: NonFungibleTokenContract) => {
      const ownedNfts = await Erc721Api.fetchTokensForAddress(nft.contract, ethAddress!);
      dispatch(addOwnedNonFungibleAsset(ownedNfts));

      return {
      };
    },
  );
};
