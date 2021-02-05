import React, { useEffect, useState } from 'react';
import * as S from './SelectTokenModal.style';
import ReactModal from 'react-modal';
import { Token } from '../AppEth/AppETH';

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
  tokens: Token[],
  onTokenSelected: (token: Token) => any;
  open: boolean;
  onClose: () => any;
};


function SelectTokenModal({
  tokens,
  onTokenSelected: setSelectedToken,
  open,
  onClose
}: Props): React.ReactElement<Props> {
  const [isOpen, setIsOpen] = useState(open);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
      setIsOpen(open)
  }, [open, setIsOpen])

  function closeModal() {
    setIsOpen(false);
    onClose();
  }

  function handleInputChange(e: React.ChangeEvent<{ value: string }>) {
    setSearchInput(e.currentTarget.value.toLowerCase());
  }

  function handleTokenSelection(selectedToken: Token) {
    setSelectedToken(selectedToken);
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
            {tokens.filter((token) =>
              token.name.toLowerCase().includes(searchInput) || 
              token.symbol.toLowerCase().includes(searchInput)
            ).map((token) => (
              <S.Token key={`${token.chainId}-${token.address}`}>
                <button onClick={() => handleTokenSelection(token)}>
                  <img src={token.logoURI} alt={`${token.name} icon`} />
                  <div>
                    <h3>{token.symbol}</h3>
                    <p>{token.name}</p>
                  </div>
                </button>
              </S.Token>
            ))}
          </S.TokenList>
          <S.Button onClick={closeModal}>Close</S.Button>
        </S.Wrapper>
      </ReactModal>
    </div>
  );
}

export default SelectTokenModal;
