/* eslint-disable @typescript-eslint/ban-types */
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import CoinGecko from 'coingecko-api';
import { SwapDirection, Token } from '../../types/types';
import { RootState } from '../reducers';
import * as ERC20 from '../../contracts/ERC20.json';
import EthApi from '../../net/eth';
import Polkadot from '../../net/polkadot';
import {
  SET_TOKEN_LIST,
  SET_SELECTED_ASSET,
  SET_DEPOSIT_AMOUNT,
  SET_SWAP_DIRECTION,
  SET_SHOW_CONFIRM_TRANSACTION_MODAL,
} from '../actionsTypes/bridge';
import { TokenData } from '../reducers/bridge';
import { fetchERC20Allowance } from './ERC20Transactions';
import { PRICE_CURRENCIES } from '../../config';

export interface SetTokenListPayload { type: string, list: TokenData[] }
export const _setTokenList = (list: TokenData[]): SetTokenListPayload => ({
  type: SET_TOKEN_LIST,
  list,
});

export interface SetSelectedAssetPayload {type: string, asset: TokenData}
export const _setSelectedAsset = (asset: TokenData)
    : SetSelectedAssetPayload => ({
  type: SET_SELECTED_ASSET,
  asset,
});

export interface SetDepositAmountPayload { type: string, amount: number }
export const setDepositAmount = (amount: number): SetDepositAmountPayload => ({
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
export const updateSelectedAsset = (asset: TokenData):
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
export const updateTokenData = (tokenData: TokenData):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { tokens, selectedAsset } = state.bridge;

  // update token data in token list
  const updatedTokens = tokens?.map((token: TokenData) => {
    if (token.token.address === tokenData?.token.address) {
      return {
        ...token,
        ...tokenData,
      };
    }

    return token;
  });
  dispatch(_setTokenList(updatedTokens!));

  // update token data in selected asset
  if (selectedAsset?.token.address === tokenData.token.address) {
    const updatedAsset = { ...selectedAsset, ...tokenData };
    dispatch(updateSelectedAsset(updatedAsset as TokenData));
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
  const ethBalance = await EthApi.getTokenBalance(web3!, ethAddress!, selectedAsset);
  const polkadotBalance = await Polkadot.getEthBalance(
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
  dispatch(updateTokenData(updatedTokenData as TokenData));
};

// use the token list to instantiate contract instances
// and store them in redux. We also query the balance to use later
export const initializeTokens = (tokens: Token[]):
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const { ethAddress, polkadotApi, polkadotAddress } = state.net;
  const CoinGeckoClient = new CoinGecko();
  // the currencies used to query the coin gecko api
  const priceCurrencies = PRICE_CURRENCIES;

  if (state.net.web3?.currentProvider) {
    const web3 = state!.net.web3!;
    // only include tokens from  current network
    const tokenList = tokens.filter(
      (token: Token) => token.chainId
              === Number.parseInt((web3.currentProvider as any).chainId, 16),
    );

    // create a web3 contract instance for each ERC20
    // and build a list of TokenData
    const tokenDataList = tokenList.map(
      (token: Token) => {
        // eth 'tokens' don't have any contract instance
        let contractInstance = null;

        // All valid contract addresses have 42 characters ('0x' + address)
        if (token.address.length === 42) {
          //   create token contract instance
          contractInstance = new web3.eth.Contract(
                ERC20.abi as any,
                token.address,
          );
        }

        return {
          token,
          prices: {
            usd: 0,
          },
          instance: contractInstance,
          balance: {
            eth: '0',
            polkadot: '0',
          },
        };
      },
    );

    // store the token list
    dispatch(_setTokenList(tokenDataList));
    // set default selected token to first token from list
    dispatch(updateSelectedAsset(tokenDataList[0]));

    // now that the token list has loaded we can
    // loop through the list and for each fetch the
    // price, balance on eth and balance on substrate
    // and asynchronously update the token list as we get each result

    tokenDataList.map(async (tokenData: TokenData) => {
      const newTokenData = tokenData;

      // fetch token balances on substrate
      try {
        const polkadotBalance = await Polkadot.getEthBalance(
            polkadotApi!,
            polkadotAddress!,
            tokenData,
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
            tokenData,
        );

        newTokenData.balance.eth = ethBalance;
        dispatch(updateTokenData(newTokenData));
      } catch (e) {
        console.log('failed reading eth balance', e);
      }

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
        if (tokenData.token.address !== '0x0'
          && tokenData.token.address.length === 42
        ) {
          assetKey = tokenData.token.address;
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
