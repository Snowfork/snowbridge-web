/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ERC20TransactionsState {
  allowance: string;
}

const initialState: ERC20TransactionsState = {
  allowance: '0',
};

export const erc20TransactionsSlice = createSlice({
  name: 'erc20Transactions',
  initialState,
  reducers: {
    setERC20Allowance: (state, action: PayloadAction<string>) => {
      state.allowance = action.payload;
    },
  },
});

export default erc20TransactionsSlice.reducer;
