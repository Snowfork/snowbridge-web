import { combineReducers } from 'redux';
import net, { NetState } from './net';
import transactions, { TransactionsState } from './transactions';
import ERC20Transactions, { ERC20TransactionsState } from './ERC20Transactions';

export interface RootState {
  net: NetState,
  transactions: TransactionsState,
  ERC20Transactions: ERC20TransactionsState
}

const rootReducer = combineReducers({
  net,
  transactions,
  ERC20Transactions,
});

export default rootReducer;
