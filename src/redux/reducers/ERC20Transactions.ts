/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';
import {
  setERC20Allowance,
} from '../actions/ERC20Transactions';

export interface ERC20TransactionsState {
  allowance: number;
}

const initialState: ERC20TransactionsState = {
  allowance: 0,
};

const erc20transactionsReducer = createReducer(initialState, (builder) => {
  builder.addCase(setERC20Allowance, (state, action) => {
    state.allowance = action.payload;
  });
});

export default erc20transactionsReducer;
