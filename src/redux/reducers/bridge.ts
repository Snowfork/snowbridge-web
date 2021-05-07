import BigNumber from 'bignumber.js';
import { RootState } from '.';
import { Asset, isDot, isEther } from '../../types/Asset';
import { SwapDirection } from '../../types/types';
import {
  SetDepositAmountPayload,
  SetSelectedAssetPayload,
  SetShowConfirmTransactionModalPayload,
  SetSwapDirectionPayload,
  SetTokenListPayload,
} from '../actions/bridge';
import {
  SET_DEPOSIT_AMOUNT,
  SET_SELECTED_ASSET,
  SET_SHOW_CONFIRM_TRANSACTION_MODAL,
  SET_SWAP_DIRECTION,
  SET_TOKEN_LIST,
} from '../actionsTypes/bridge';

export interface BridgeState {
  assets: Asset[],
  selectedAsset?: Asset
  depositAmount: string,
  swapDirection: SwapDirection,
  showConfirmTransactionModal: boolean
}

const initialState: BridgeState = {
  assets: [],
  selectedAsset: undefined,
  depositAmount: '0.0',
  swapDirection: SwapDirection.EthereumToPolkadot,
  showConfirmTransactionModal: false,
};

function bridgeReducer(state: BridgeState = initialState, action: any)
  : BridgeState {
  switch (action.type) {
    case SET_TOKEN_LIST: {
      return ((action: SetTokenListPayload): BridgeState => ({
        ...state,
        assets: action.list,
      }))(action);
    }
    case SET_SELECTED_ASSET: {
      return ((action: SetSelectedAssetPayload): BridgeState => ({
        ...state,
        selectedAsset: action.asset,
      }))(action);
    }
    case SET_DEPOSIT_AMOUNT: {
      return ((action: SetDepositAmountPayload): BridgeState => ({
        ...state,
        depositAmount: action.amount,
      }))(action);
    }
    case SET_SWAP_DIRECTION: {
      return ((action: SetSwapDirectionPayload): BridgeState => ({
        ...state,
        swapDirection: action.direction,
      }))(action);
    }
    case SET_SHOW_CONFIRM_TRANSACTION_MODAL: {
      return ((action: SetShowConfirmTransactionModalPayload): BridgeState => ({
        ...state,
        showConfirmTransactionModal: action.open,
      }))(action);
    }
    default:
      return state;
  }
}

export default bridgeReducer;

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

// seletors
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
