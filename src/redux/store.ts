import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import net from './reducers/net';
import transactions from './reducers/transactions';
import ERC20Transactions from './reducers/ERC20Transactions';
import ERC721Transactions from './reducers/ERC721Transactions';
import bridgeReducer from './reducers/bridge';
import bridgeHealthReducer from './reducers/bridgeHealth';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';


const persistConfig = {
  key: 'root',
  storage: localStorage,
  whitelist: ['transactions']
};

const reducers = combineReducers({
  net,
  transactions,
  ERC20Transactions,
  ERC721Transactions,
  bridge: bridgeReducer,
  bridgeHealth: bridgeHealthReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunkMiddleware],
});

let persistor = persistStore(store);

export { store, persistor };
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
