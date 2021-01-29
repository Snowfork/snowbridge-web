import { combineReducers } from 'redux';
import net from './net';
import transactions from './transactions';

export default combineReducers({
  net,
  transactions
});
