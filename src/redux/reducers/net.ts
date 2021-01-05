import {
  SET_NET,
  SET_METAMASK_FOUND,
  SET_POLKADOTJS_FOUND,
  SET_METAMASK_CONNECTED,
  SET_POLKADOTJS_CONNECTED,
  SET_METAMASK_MISSING,
  SET_POLKADOTJS_MISSING,
  SET_METAMASK_NETWORK,
} from '../actionsTypes';

const initialState = {
  client: null,
  metamaskFound: false,
  polkadotJSFound: false,
  metamaskConnected: false,
  polkadotJSConnected: false,
  metamaskMissing: false,
  polkadotJSMissing: false,
  metamaskNetwork: '',
};

function netReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_NET: {
      return Object.assign({}, state, { client: action.payload });
    }
    case SET_METAMASK_FOUND: {
      return Object.assign({}, state, { metamaskFound: true });
    }
    case SET_POLKADOTJS_FOUND: {
      return Object.assign({}, state, { polkadotJSFound: true });
    }
    case SET_METAMASK_CONNECTED: {
      return Object.assign({}, state, { metamaskConnected: true });
    }
    case SET_POLKADOTJS_CONNECTED: {
      return Object.assign({}, state, { polkadotJSConnected: true });
    }
    case SET_METAMASK_MISSING: {
      return Object.assign({}, state, { metamaskMissing: true });
    }
    case SET_POLKADOTJS_MISSING: {
      return Object.assign({}, state, { polkadotJSMissing: true });
    }
    case SET_METAMASK_NETWORK: {
      return Object.assign({}, state, {
        metamaskNetwork: action.metamaskNetwork,
      });
    }
    default:
      return state;
  }
}

export default netReducer;
