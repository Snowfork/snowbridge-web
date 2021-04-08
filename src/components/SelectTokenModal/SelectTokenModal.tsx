import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import {
  Button,
  Typography,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import * as S from './SelectTokenModal.style';
import { RootState } from '../../redux/reducers';
import { setSelectedAsset } from '../../redux/actions/bridge';
import { TokenData } from '../../redux/reducers/bridge';
import { fetchERC20Allowance } from '../../redux/actions/ERC20Transactions';

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
  const { tokens } = useSelector((state: RootState) => state.bridge);
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
    dispatch(setSelectedAsset(selectedAsset));
    dispatch(fetchERC20Allowance());
    closeModal();
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
                          <Typography>{ tokenData.balance.eth}</Typography>
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
