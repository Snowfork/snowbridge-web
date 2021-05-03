import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import {
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { useDispatch, useSelector } from 'react-redux';
import { getNetworkNames, shortenWalletAddress } from '../../utils/common';
import { RootState } from '../../redux/reducers';
import { SwapDirection } from '../../types/types';
import { setShowConfirmTransactionModal } from '../../redux/actions/bridge';
import LockToken from './LockToken';
import { symbols } from '../../types/Asset';

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
  const {
    ethAddress,
    polkadotAddress,
  } = useSelector((state: RootState) => state.net);
  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useSelector((state: RootState) => state.bridge);

  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  function closeModal() {
    setIsOpen(false);
    dispatch(setShowConfirmTransactionModal(false));
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
          <Grid container justify="center">
            <Grid item>
              <Typography>
                Confirm transfer
              </Typography>
            </Grid>

            <Grid item container justify="center">
              <Typography variant="h4">
                {depositAmount}
                {' '}
                {symbols(selectedAsset!, swapDirection).from}
              </Typography>
            </Grid>

            <Grid item container justify="space-between">
              <Grid item>
                <Typography>
                  {getNetworkNames(swapDirection).from}
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
                  {getNetworkNames(swapDirection).to}
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

            <LockToken />
          </Grid>

        </Paper>
      </ReactModal>
    </div>
  );
}

export default ConfirmTransactionModal;
