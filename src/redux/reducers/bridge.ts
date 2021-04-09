import { Token, SwapDirection } from '../../types';
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

export interface TokenData {
    token: Token,
    balance: {
        eth: string,
        polkadot: string
    },
    instance: any
}

export interface BridgeState {
  tokens?: TokenData[],
  selectedAsset?: TokenData,
  depositAmount: number,
  swapDirection: SwapDirection,
  showConfirmTransactionModal: boolean
}

const initialState: BridgeState = {
  tokens: [],
  selectedAsset: undefined,
  depositAmount: 0.0,
  swapDirection: SwapDirection.EthereumToPolkadot,
  showConfirmTransactionModal: false,
};

function bridgeReducer(state: BridgeState = initialState, action: any)
  : BridgeState {
  switch (action.type) {
    case SET_TOKEN_LIST: {
      return ((action: SetTokenListPayload): BridgeState => ({
        ...state,
        tokens: action.list,
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
