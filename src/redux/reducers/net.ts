import { SET_NET } from '../actionsTypes';

const initialState = {};

function netReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_NET: {
      return { ...state, ...action.payload };
    }
    default:
      return state;
  }
}

export default netReducer;
