import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import net from './reducers/net';
import transactions from './reducers/transactions';
import ERC20Transactions from './reducers/ERC20Transactions';
import bridgeReducer from './reducers/bridge';

const store = configureStore({
  reducer: {
    net,
    transactions,
    ERC20Transactions,
    bridge: bridgeReducer,
  },
  middleware: [thunkMiddleware],
});

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
