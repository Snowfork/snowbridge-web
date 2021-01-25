import { combineReducers } from 'redux';
import net from './net';
import transactions from './transactions';
import notifications from './notifications';

export default combineReducers({
  net,
  transactions,
  notifications,
});
