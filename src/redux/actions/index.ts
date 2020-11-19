import { SET_NET } from '../actionsTypes';

export const setNet = (net: any) => {
  return {
    type: SET_NET,
    payload: net,
  };
};
