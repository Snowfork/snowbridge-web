import React from 'react';
import {
  TransactionStatus,
} from '../../redux/reducers/transactions';
import LoadingSpinner from '../LoadingSpinner';
import { useAppSelector } from '../../utils/hooks';
import { getChainsFromDirection, assetToString, getChainName } from '../../utils/common';

import { Heading } from '../Modal/Modal.style';
import ChainDisplay from '../Bridge/TransferPanel/ChainDisplay';

const PendingTransaction = (): React.ReactElement => {
  const transactions = useAppSelector((state) => state.transactions);
  const bridge = useAppSelector((state) => state.bridge);

  const chains = getChainsFromDirection(transactions.pendingTransaction!.direction);

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
    const Message = (
      <h4>
        Bridging
        {assetToString(transactions.pendingTransaction.asset!, bridge.depositAmount)}
        from
        <ChainDisplay chain={chains.from} />
        to
        <ChainDisplay chain={chains.to} />
      </h4>
    );

    return (
      <div>
        <Heading>Submitting transaction</Heading>
        {Message}
        <div style={{ width: '40px', height: '40px' }}>
          <LoadingSpinner />
        </div>
        <div>Confirm this transaction in your wallet</div>
      </div>
    );
  }

  return <>Pending...</>;
};

export default PendingTransaction;
