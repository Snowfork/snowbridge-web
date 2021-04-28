/* eslint-disable @typescript-eslint/ban-types */
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import CoinGecko from 'coingecko-api';
import { Chain, SwapDirection, Token } from '../../types/types';
import { RootState } from '../reducers';
import * as ERC20 from '../../contracts/ERC20.json';
import * as WrappedToken from '../../contracts/WrappedToken.json';
import EthApi from '../../net/eth';
import Polkadot from '../../net/polkadot';
import {
  SET_TOKEN_LIST,
  SET_SELECTED_ASSET,
  SET_DEPOSIT_AMOUNT,
  SET_SWAP_DIRECTION,
  SET_SHOW_CONFIRM_TRANSACTION_MODAL,
} from '../actionsTypes/bridge';
import { fetchERC20Allowance } from './ERC20Transactions';
import { PRICE_CURRENCIES } from '../../config';
import { Asset, createAsset, isErc20 } from '../../types/Asset';
import Erc20TokenList from '../../assets/tokens/Erc20Tokens.json';
import DotTokenList from '../../assets/tokens/DotTokens';
import EthTokenList from '../../assets/tokens/EthTokens.json';

export interface SetTokenListPayload { type: string, list: Asset[] }
export const _setTokenList = (list: Asset[]): SetTokenListPayload => ({
  type: SET_TOKEN_LIST,
  list,
});

export interface SetSelectedAssetPayload {type: string, asset: Asset}
export const _setSelectedAsset = (asset: Asset)
    : SetSelectedAssetPayload => ({
  type: SET_SELECTED_ASSET,
  asset,
});

export interface SetDepositAmountPayload { type: string, amount: string }
export const setDepositAmount = (amount: string): SetDepositAmountPayload => ({
  type: SET_DEPOSIT_AMOUNT,
  amount,
});

export interface SetSwapDirectionPayload { type: string, direction: SwapDirection }
export const setSwapDirection = (direction: SwapDirection): SetSwapDirectionPayload => ({
  type: SET_SWAP_DIRECTION,
  direction,
});

export interface SetShowConfirmTransactionModalPayload {type: string, open: boolean}
export const setShowConfirmTransactionModal = (open: boolean)
  : SetShowConfirmTransactionModalPayload => ({
  type: SET_SHOW_CONFIRM_TRANSACTION_MODAL,
  open,
});

// async middleware actions
// sets selected asset and updates ERC20 spend allowance
export const updateSelectedAsset = (asset: Asset):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  // upate selected asset
  dispatch(_setSelectedAsset(asset));

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
        // TODO: test this?
        // ...asset,
        // ..._asset,
        ..._asset,
        ...asset,
      };
    }

    return _asset;
  });
  dispatch(_setTokenList(updatedTokens as Asset[]));

  // update token data in selected asset
  if (selectedAsset?.address === asset.address) {
    const updatedAsset = { ...selectedAsset, ...asset };
    dispatch(updateSelectedAsset(updatedAsset as Asset));
  }
};

// update balances for selected asset
// updates values for selected asset as well as the token list
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

  // fetch updated balances
  const ethBalance = await EthApi.getTokenBalance(web3!, ethAddress!, selectedAsset!);
  const polkadotBalance = await Polkadot.getEthBalance(
      polkadotApi!,
      polkadotAddress!,
      selectedAsset!,
  );

  const updatedTokenData = {
    ...selectedAsset,
    balance: {
      eth: ethBalance,
      polkadot: polkadotBalance,
    },
  };
  dispatch(updateTokenData(updatedTokenData as Asset));
};

// use the token list to instantiate contract instances
// and store them in redux. We also query the balance to use later
export const initializeTokens = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { ethAddress, polkadotApi, polkadotAddress } = state.net;
  const CoinGeckoClient = new CoinGecko();
  // the currencies used to query the coin gecko api
  const priceCurrencies = PRICE_CURRENCIES;

  const { tokens } = Erc20TokenList;

  if (state.net.web3?.currentProvider) {
    const web3 = state!.net.web3!;
    // only include tokens from  current network
    const networkFilter = (token: Token) => token.chainId
    === Number.parseInt((web3.currentProvider as any).chainId, 16);

    const erc20TokenListFiltered = tokens.filter(
      networkFilter,
    );
    const dotTokenListFiltered = DotTokenList.filter(networkFilter);
    const ethTokenListFiltered = EthTokenList.tokens.filter(networkFilter);

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

    // store the token list
    dispatch(_setTokenList(assetList));
    // set default selected token to first token from list
    dispatch(updateSelectedAsset(assetList[0]));

    // now that the token list has loaded we can
    // loop through the list and for each fetch the
    // price, balance on eth and balance on substrate
    // and asynchronously update the token list as we get each result

    assetList.map(async (asset: Asset) => {
      const newTokenData = asset;

      // fetch token balances on substrate
      try {
        const polkadotBalance = await Polkadot.getEthBalance(
            polkadotApi!,
            polkadotAddress!,
            asset,
        );

        newTokenData.balance.polkadot = polkadotBalance;
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

        newTokenData.balance.eth = ethBalance;
        dispatch(updateTokenData(newTokenData));
      } catch (e) {
        console.log('failed reading eth balance', e);
      }

      // TODO: move to the API
      // fetch token price from coin gecko
      try {
        // store the asset key name to read the result later
        let assetKey = 'ethereum';
        // price request for eth
        let priceRequestPromise = CoinGeckoClient.simple.price({
          ids: assetKey,
          vs_currencies: priceCurrencies,
        });
          // change price request for erc20
        if (isErc20(asset)) {
          assetKey = asset.address;
          priceRequestPromise = CoinGeckoClient.simple.fetchTokenPrice({
            contract_addresses: assetKey,
            vs_currencies: priceCurrencies,
          });
        }

        // do pricing request
        const data = await priceRequestPromise;
        if (data.success) {
          // append to prices
          let prices = { ...newTokenData.prices };
          prices = { ...prices, ...data.data[assetKey] };
          newTokenData.prices = prices;
          // update price in state
          dispatch(updateTokenData(newTokenData));
        }
      } catch (e) {
        console.log('error fetching price', e);
      }
    });
  }
};
