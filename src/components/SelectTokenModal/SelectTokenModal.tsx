import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import {
  Button,
  Typography,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { utils } from 'ethers';
import * as S from './SelectTokenModal.style';
import { RootState } from '../../redux/reducers';
import { updateSelectedAsset } from '../../redux/actions/bridge';
import { Asset, decimals, symbols } from '../../types/Asset';
import { SwapDirection } from '../../types/types';

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
  onClose: () => any;
};

function SelectTokenModal({
  open,
  onClose,
}: Props): React.ReactElement<Props> {
  const [isOpen, setIsOpen] = useState(open);
  const [searchInput, setSearchInput] = useState('');
  const { assets, swapDirection } = useSelector((state: RootState) => state.bridge);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  function closeModal() {
    setIsOpen(false);
    onClose();
  }

  function handleInputChange(e: React.ChangeEvent<{ value: string }>) {
    setSearchInput(e.currentTarget.value.toLowerCase());
  }

  function handleTokenSelection(selectedAsset: Asset) {
    dispatch(updateSelectedAsset(selectedAsset));
    closeModal();
  }

  // returns display formatted balance for source chain
  function getTokenBalance(asset: Asset): string {
    const { from } = decimals(asset, swapDirection);

    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      return utils.formatUnits(asset.balance.eth, from);
    }
    return utils.formatUnits(asset.balance.polkadot, from);
  }

  return (
    <div>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Select Token"
      >
        <S.Wrapper>
          <S.Heading>Select Token</S.Heading>
          <S.Input onChange={handleInputChange} />
          <S.TokenList>
            {
              assets
              // filter assets by search term
                ?.filter(
                  (asset: Asset) => asset.name.toLowerCase().includes(searchInput)
                  || asset.symbol.toLowerCase().includes(searchInput),
                ).map(
                  // render each asset
                  (asset: Asset) => (
                    <S.Token key={`${asset.chainId}-${asset.address}`}>
                      <Button onClick={() => handleTokenSelection(asset)}>
                        <img src={asset.logoUri} alt={`${asset.name} icon`} />
                        <div>
                          <Typography variant="caption">{symbols(asset, swapDirection).from}</Typography>
                          <Typography>{ getTokenBalance(asset)}</Typography>
                        </div>
                      </Button>
                    </S.Token>
                  ),
                )
            }
          </S.TokenList>
          <S.Button onClick={closeModal}>Close</S.Button>
        </S.Wrapper>
      </ReactModal>
    </div>
  );
}

export default SelectTokenModal;
