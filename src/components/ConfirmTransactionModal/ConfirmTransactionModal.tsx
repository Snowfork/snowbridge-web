import React, { useCallback, useEffect, useState } from 'react';

import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { useDispatch } from 'react-redux';
import { getChainsFromDirection, shortenWalletAddress } from '../../utils/common';
import { SwapDirection } from '../../types/types';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import LockToken from './LockToken';
import { isNonFungible, NonFungibleToken, symbols } from '../../types/Asset';
import PendingTransactionsModal from '../PendingTransactionsUI/PendingTransactions';
import { useAppSelector } from '../../utils/hooks';

import Panel from '../Panel/Panel';

import Modal from '../Modal/Modal';
import { Heading } from '../Modal/Modal.style';

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

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
      >
        <Heading>
          Confirm transfer
        </Heading>
        {
          isPending ? <PendingTransactionsModal /> : (
            <div>

              {
                selectedAsset && isNonFungible(selectedAsset)
                  ? (
                    <Panel>
                      <div>
                        {
                          selectedAsset
                          && symbols(selectedAsset, swapDirection).from
                        }
                        {' '}
                        [
                        {(selectedAsset?.token as NonFungibleToken).ethId}
                        ]
                      </div>
                    </Panel>
                  )

                  : (
                    <Panel>
                      <div>
                        {depositAmount}
                        {' '}
                        {
                          selectedAsset
                          && symbols(selectedAsset, swapDirection).from
                        }
                      </div>
                    </Panel>
                  )
              }

              <div>
                <Panel>
                  <div>
                    {getChainsFromDirection(swapDirection).from}
                  </div>
                  <div>
                    Sending Address
                  </div>
                  <div>
                    {
                      shortenWalletAddress(
                        addresses.from ?? '',
                      )
                    }
                  </div>
                </Panel>
                <ArrowRightIcon />
                <Panel>
                  <div>
                    {getChainsFromDirection(swapDirection).to}
                  </div>
                  <div>
                    Receiving Address
                  </div>
                  <div>
                    {
                      shortenWalletAddress(
                        addresses.to ?? '',
                      )
                    }
                  </div>
                </Panel>

              </div>

              <LockToken onTokenLocked={onTokenLocked} />
            </div>
          )
        }

      </Modal>
    </div >
  );
}

export default ConfirmTransactionModal;
