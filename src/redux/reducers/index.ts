import { combineReducers } from 'redux';
import net, { NetState } from './net';
import transactions, { TransactionsState } from './transactions';
import ERC20Transactions, { ERC20TransactionsState } from './ERC20Transactions';
import bridgeReducer, { BridgeState } from './bridge';

export interface RootState {
  net: NetState,
  transactions: TransactionsState,
  ERC20Transactions: ERC20TransactionsState,
  bridge: BridgeState
}

const rootReducer = combineReducers({
  net,
  transactions,
  ERC20Transactions,
  bridge: bridgeReducer,
});

export default rootReducer;
