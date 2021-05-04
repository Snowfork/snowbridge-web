import React from 'react';
import { useSelector } from 'react-redux';
import {
  TransactionStatus,
} from '../../redux/reducers/transactions';
import LoadingSpinner from '../LoadingSpinner';
import { RootState } from '../../redux/store';
import { symbols } from '../../types/Asset';

const PendingTransaction = (): React.ReactElement => {
  const transactions = useSelector((state: RootState) => state.transactions);
  const bridge = useSelector((state: RootState) => state.bridge);

  /* tx rejected / error */
  if (transactions.pendingTransaction?.status === TransactionStatus.REJECTED) {
    return (
      <div>
        <h3>Error</h3>
        <h4>Transaction rejected.</h4>
        <p>{transactions.pendingTransaction.error}</p>
      </div>
    );
  }

  /* submitting - waiting for confirmation in metamask */
  if (transactions.pendingTransaction?.status === TransactionStatus.SUBMITTING_TO_CHAIN) {
    return (
      <div>
        <div style={{ width: '40px', height: '40px' }}>
          <LoadingSpinner />
        </div>
        <h3>Submitting transaction</h3>
        <h4>
          Bridging
          {' '}
          {bridge.depositAmount}
          {' '}
          {
      symbols(
        transactions.pendingTransaction.asset,
        bridge.swapDirection,
      ).from
      }
          {' '}
          to
          {' '}
          {bridge.depositAmount}
          {' '}
          {
      symbols(
        transactions.pendingTransaction.asset,
        bridge.swapDirection,
      ).to
      }
        </h4>
        <div>Confirm this transaction in your wallet</div>
      </div>
    );
  }

  return <>Pending...</>;
};

export default PendingTransaction;
