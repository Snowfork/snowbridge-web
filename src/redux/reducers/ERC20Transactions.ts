import {
  SetERC20AllowancePayload,
} from '../actions/ERC20Transactions';
import {
  SET_TOKEN_ALLOWANCE,
} from '../actionsTypes/ERC20Transactions';

export interface ERC20TransactionsState {
  allowance: number;
}

const initialState: ERC20TransactionsState = {
  allowance: 0,
};

function transactionsReducer(state: ERC20TransactionsState = initialState, action: any)
  : ERC20TransactionsState {
  switch (action.type) {
    case SET_TOKEN_ALLOWANCE: {
      return ((action: SetERC20AllowancePayload) => (
        { ...state, allowance: action.allowance }
      ))(action);
    }
    default:
      return state;
  }
}

export default transactionsReducer;
