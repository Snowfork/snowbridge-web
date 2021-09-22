import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import net from './reducers/net';
import transactions from './reducers/transactions';
import ERC20Transactions from './reducers/ERC20Transactions';
import ERC721Transactions from './reducers/ERC721Transactions';
import bridgeReducer from './reducers/bridge';
import bridgeHealthReducer from './reducers/bridgeHealth';

const store = configureStore({
  reducer: {
    net,
    transactions,
    ERC20Transactions,
    ERC721Transactions,
    bridge: bridgeReducer,
    bridgeHealth: bridgeHealthReducer,
  },
  middleware: [thunkMiddleware],
});

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
