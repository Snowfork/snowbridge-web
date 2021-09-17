import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { useDispatch } from 'react-redux';
import { getChainsFromDirection } from '../../utils/common';
import {
  TransactionStatus,
} from '../../redux/reducers/transactions';
import { SwapDirection } from '../../types/types';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import LockToken from './LockToken';
import RejectedTransaction from './RejectedTransaction';
import { useAppSelector } from '../../utils/hooks';

import Modal from '../Modal/Modal';
import { Heading } from '../Modal/Modal.style';

import TransferBlock from './TransferBlock';

type Props = {
  open: boolean;
  className?: string;
};

function ConfirmTransactionModal({
  open, className,
}: Props): React.ReactElement<Props> {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(open);
  const [transactionPending, setTransactionPending] = useState(false);
  const {
    ethAddress,
    polkadotAddress,
  } = useAppSelector((state) => state.net);
  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const transactions = useAppSelector((state) => state.transactions);
  const pendingTransaction = transactions.pendingTransaction;
  const rejected = transactionPending && pendingTransaction?.status === TransactionStatus.REJECTED;
  const submitting = transactionPending && pendingTransaction?.status === TransactionStatus.SUBMITTING_TO_CHAIN;

  const closeModal = useCallback(() => {
    setIsOpen(false);
    dispatch(setShowConfirmTransactionModal(false));
    setTransactionPending(false);
  }, [setIsOpen, setTransactionPending, dispatch]);

  useEffect(() => {
    if (open) {
      setIsOpen(true);
    } else {
      closeModal();
    }
  }, [open, setIsOpen, closeModal]);

  function onTokenLocked() {
    setTransactionPending(true);
  }

  const addresses = {
    to: swapDirection === SwapDirection.EthereumToPolkadot
      ? polkadotAddress
      : ethAddress,
    from: swapDirection === SwapDirection.EthereumToPolkadot
      ? ethAddress
      : polkadotAddress,
  };

  if (!isOpen) {
    return <div></div>;
  }

  const chains = {
    from: getChainsFromDirection(swapDirection).from,
    to: getChainsFromDirection(swapDirection).to
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      type={rejected ? 'error' : undefined}
    >
      {
        rejected ? <RejectedTransaction
          error={pendingTransaction!.error!}
        /> : (
          <div className={className}>
            <Heading>
              {submitting ? 'Submitting transaction' : 'Confirm transfer'}
            </Heading>
            <TransferBlock
              asset={selectedAsset!}
              amount={depositAmount}
              chains={chains}
              addresses={addresses}
            />
            <LockToken transactionPending={transactionPending} onTokenLocked={onTokenLocked} />
          </div>
        )
      }
    </Modal >
  );
}

export default styled(ConfirmTransactionModal)`
gap: 10px;
display: flex;
flex-direction: column;
min-width: 480px;
align-items: center;
`;
