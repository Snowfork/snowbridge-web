import { SET_NET, SET_METAMASK_FOUND, SET_METAMASK_CONNECTED, SET_POLKADOTJS_FOUND,
  SET_POLKADOTJS_CONNECTED, SET_METAMASK_MISSING, SET_POLKADOTJS_MISSING } from '../actionsTypes';

export const setNet = (net: any) => {
  return {
    type: SET_NET,
    payload: net,
  };
};

export const setMetamaskFound = () => {
  return {
    type: SET_METAMASK_FOUND
  };
};

export const setMetamaskConnected = () => {
  return {
    type: SET_METAMASK_CONNECTED
  };
};

export const setPolkadotJSFound = () => {
  return {
    type: SET_POLKADOTJS_FOUND
  };
};

export const setPolkadotJSConnected = () => {
  return {
    type: SET_POLKADOTJS_CONNECTED
  };
};

export const setMetamaskMissing = () => {
  return {
    type: SET_METAMASK_MISSING
  };
};

export const setPolkadotJSMissing = () => {
  return {
    type: SET_POLKADOTJS_MISSING
  };
};