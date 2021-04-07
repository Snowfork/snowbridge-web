import { Token } from '../../types';
import { SetSelectedAssetPayload, SetTokenListPayload } from '../actions/bridge';
import { SET_SELECTED_ASSET, SET_TOKEN_LIST } from '../actionsTypes/bridge';

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
    selectedAsset?: TokenData
}

const initialState: BridgeState = {
  tokens: [],
  selectedAsset: undefined,
};

function bridgeReducer(state: BridgeState = initialState, action: any)
  : BridgeState {
  switch (action.type) {
    case SET_TOKEN_LIST: {
      return ((action: SetTokenListPayload) => ({
        ...state,
        tokens: action.list,
      }))(action);
    }
    case SET_SELECTED_ASSET: {
      return ((action: SetSelectedAssetPayload) => ({
        ...state,
        selectedAsset: action.asset,
      }))(action);
    }
    default:
      return state;
  }
}

export default bridgeReducer;
