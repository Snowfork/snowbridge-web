import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum TabState {
  Transfer,
  Status,
}

export const tabSlice = createSlice({
  name: 'tab',
  initialState: TabState.Transfer,
  reducers: {
    toggleTab:
      (state, action: PayloadAction<TabState>) => {
        if(state === action.payload) {
          state = TabState.Transfer;
        }
        else {
          state = action.payload;
        }
        return state;
      },
  },
});

export default tabSlice.reducer;