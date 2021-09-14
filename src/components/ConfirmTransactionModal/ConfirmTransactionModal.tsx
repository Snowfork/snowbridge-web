import React, { useCallback, useEffect, useState } from 'react';

import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { useDispatch } from 'react-redux';
import { getChainsFromDirection, assetToString } from '../../utils/common';
import { SwapDirection } from '../../types/types';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import LockToken from './LockToken';
import PendingTransactionsModal from '../PendingTransactionsUI/PendingTransactions';
import { useAppSelector } from '../../utils/hooks';

import Modal from '../Modal/Modal';
import { Heading } from '../Modal/Modal.style';

import AddressBlock from './AddressBlock';

type Props = {
  open: boolean;
};

function ConfirmTransactionModal({
  open,
}: Props): React.ReactElement<Props> {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(open);
  const [isPending, setIsPending] = useState(false);
  const {
    ethAddress,
    polkadotAddress,
  } = useAppSelector((state) => state.net);
  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    dispatch(setShowConfirmTransactionModal(false));
    setIsPending(false);
  }, [setIsOpen, setIsPending, dispatch]);

  useEffect(() => {
    if (open) {
      setIsOpen(true);
    } else {
      closeModal();
    }
  }, [open, setIsOpen, closeModal]);

  function onTokenLocked() {
    setIsPending(true);
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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
    >
      {
        isPending ? <PendingTransactionsModal /> : (
          <div>
            <Heading>
              Confirm transfer
            </Heading>
            {assetToString(selectedAsset!, depositAmount)}
            <div>
              <AddressBlock
                type="sending"
                chain={getChainsFromDirection(swapDirection).from}
                address={addresses.from!}
              />
              <ArrowRightIcon />
              <AddressBlock
                type="receiving"
                chain={getChainsFromDirection(swapDirection).to}
                address={addresses.to!}
              />
            </div>
            <LockToken onTokenLocked={onTokenLocked} />
          </div>
        )
      }

    </Modal>
  );
}

export default ConfirmTransactionModal;
