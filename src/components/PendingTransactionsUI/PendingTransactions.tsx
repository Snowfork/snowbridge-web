import React from 'react';
import {
  TransactionStatus,
} from '../../redux/reducers/transactions';
import LoadingSpinner from '../LoadingSpinner';
import { isNonFungible, NonFungibleToken, symbols } from '../../types/Asset';
import { useAppSelector } from '../../utils/hooks';
import { getNetworkNames } from '../../utils/common';

const PendingTransaction = (): React.ReactElement => {
  const transactions = useAppSelector((state) => state.transactions);
  const bridge = useAppSelector((state) => state.bridge);

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
    let Message = (
      <h4>
        Bridging
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
    );

    if (isNonFungible(transactions.pendingTransaction.asset)) {
      const { asset } = transactions.pendingTransaction;
      const token = asset.token as NonFungibleToken;
      Message = (
        <div>

          Bridging
          {' '}
          {asset
            && symbols(asset, bridge.swapDirection).from}
          [
          {token.ethId}
          ]

          from
          {' '}
          {getNetworkNames(bridge.swapDirection).from}
          {' '}
          to
          {' '}
          {getNetworkNames(bridge.swapDirection).to}

        </div>
      );
    }

    return (
      <div>
        <div style={{ width: '40px', height: '40px' }}>
          <LoadingSpinner />
        </div>
        <h3>Submitting transaction</h3>
        {Message}
        <div>Confirm this transaction in your wallet</div>
      </div>
    );
  }

  return <>Pending...</>;
};

export default PendingTransaction;
