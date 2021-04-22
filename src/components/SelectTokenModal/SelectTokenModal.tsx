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
import { TokenData } from '../../redux/reducers/bridge';
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
  const { tokens, swapDirection } = useSelector((state: RootState) => state.bridge);
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

  function handleTokenSelection(selectedAsset: TokenData) {
    dispatch(updateSelectedAsset(selectedAsset));
    closeModal();
  }

  // returns display formatted balance for source chain
  function getTokenBalance(tokenData: TokenData): string {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      return utils.formatUnits(tokenData.balance.eth, tokenData.token.decimals);
    }
    return utils.formatUnits(tokenData.balance.polkadot, tokenData.token.decimals);
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
              tokens
                ?.filter(
                  (token) => token.token.name.toLowerCase().includes(searchInput)
                  || token.token.symbol.toLowerCase().includes(searchInput),
                ).map(
                  (tokenData) => (
                    <S.Token key={`${tokenData.token.chainId}-${tokenData.token.address}`}>
                      <Button onClick={() => handleTokenSelection(tokenData)}>
                        <img src={tokenData.token.logoURI} alt={`${tokenData.token.name} icon`} />
                        <div>
                          <Typography variant="caption">{tokenData.token.symbol}</Typography>
                          <Typography>{ getTokenBalance(tokenData)}</Typography>
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
