import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ERC721TransactionsState {
  approved: boolean;
}

const initialState: ERC721TransactionsState = {
  approved: false,
};

export const erc721TransactionsSlice = createSlice({
  name: 'erc721Transactions',
  initialState,
  reducers: {
    setERC721Approved: (state, action: PayloadAction<boolean>) => {
      state.approved = action.payload;
    },
  },
});

export default erc721TransactionsSlice.reducer;
