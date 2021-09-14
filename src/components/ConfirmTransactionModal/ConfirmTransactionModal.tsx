import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { useDispatch } from 'react-redux';
import { getChainsFromDirection, assetToString } from '../../utils/common';
import { SwapDirection } from '../../types/types';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import LockToken from './LockToken';
import PendingTransaction from './PendingTransaction';
import { useAppSelector } from '../../utils/hooks';

import Modal from '../Modal/Modal';
import { Heading } from '../Modal/Modal.style';

import AddressBlock from './AddressBlock';

type Props = {
  open: boolean;
  className?: string;
};

function ConfirmTransactionModal({
  open, className,
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
        isPending ? <PendingTransaction /> : (
          <div className={className}>
            <Heading>
              Confirm transfer
            </Heading>
            <div className="confirm-modal-asset-name">
              {assetToString(selectedAsset!, depositAmount)}
            </div>
            <div className="confirm-modal-address-blocks">
              <AddressBlock
                type="sending"
                chain={getChainsFromDirection(swapDirection).from}
                address={addresses.from!}
              />
              <div>--&#62;---&#62;---&#62;--</div>
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

export default styled(ConfirmTransactionModal)`
gap: 10px;
display: flex;
flex-direction: column;
min-width: 480px;
align-items: center;

.confirm-modal-asset-name {
  font-size: 16px;
  text-align: center;
  width: 100%;
  text-transform: uppercase;
}

.confirm-modal-address-blocks {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
`;
