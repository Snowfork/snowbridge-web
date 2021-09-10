import React, { useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import {
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { useDispatch } from 'react-redux';
import { getChainsFromDirection, shortenWalletAddress } from '../../utils/common';
import { SwapDirection } from '../../types/types';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import LockToken from './LockToken';
import { isNonFungible, NonFungibleToken, symbols } from '../../types/Asset';
import PendingTransactionsModal from '../PendingTransactionsUI/PendingTransactions';
import { useAppSelector } from '../../utils/hooks';

const customStyles = {
  overlay: {},
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
    padding: '0',
  },
};

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
      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Confirm Transaction"
      >
        <Paper>
          {
            isPending ? <PendingTransactionsModal /> : (
              <Grid container justifyContent="center">

                <Grid item>
                  <Typography>
                    Confirm transfer
                  </Typography>
                </Grid>

                {
                  selectedAsset && isNonFungible(selectedAsset)
                    ? (
                      <Grid item container justifyContent="center">
                        <Typography variant="h4">
                          {
                            selectedAsset
                            && symbols(selectedAsset, swapDirection).from
                          }
                          {' '}
                          [
                          {(selectedAsset?.token as NonFungibleToken).ethId}
                          ]
                        </Typography>
                      </Grid>
                    )

                    : (
                      <Grid item container justifyContent="center">
                        <Typography variant="h4">
                          {depositAmount}
                          {' '}
                          {
                            selectedAsset
                            && symbols(selectedAsset, swapDirection).from
                          }
                        </Typography>
                      </Grid>
                    )
                }

                <Grid item container justifyContent="space-between">
                  <Grid item>
                    <Typography>
                      {getChainsFromDirection(swapDirection).from}
                    </Typography>
                    <Typography variant="caption">
                      Sending Address
                    </Typography>
                    <Typography>
                      {
                        shortenWalletAddress(
                          addresses.from ?? '',
                        )
                      }
                    </Typography>
                  </Grid>
                  <ArrowRightIcon />
                  <Grid item>
                    <Typography>
                      {getChainsFromDirection(swapDirection).to}
                    </Typography>
                    <Typography variant="caption">
                      Receiving Address
                    </Typography>
                    <Typography>
                      {
                        shortenWalletAddress(
                          addresses.to ?? '',
                        )
                      }
                    </Typography>
                  </Grid>

                </Grid>

                <LockToken onTokenLocked={onTokenLocked} />
              </Grid>
            )
          }

        </Paper>
      </ReactModal>
    </div>
  );
}

export default ConfirmTransactionModal;
