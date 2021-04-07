import React, { useState } from 'react';
import * as S from './CurrencyDisplay.style';
import Modal from '../Modal';
import {
  formatToDecimalString,
  shortenWalletAddress,
} from '../../utils/common';

type Props = {
  balance: number | string;
  currencyCode: string;
  address: string;
  icon: string;
  provider: string;
};

function CurrencyDisplay({
  balance,
  currencyCode,
  address,
  icon,
  provider,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <S.Wrapper>
      <S.Icon src={icon} alt={`${provider} currency`} />
      <S.Container>
        <S.Amount>
          {formatToDecimalString(balance, 3)}
          {' '}
          {currencyCode}
        </S.Amount>
        <S.Address onClick={openModal}>
          {shortenWalletAddress(address)}
        </S.Address>
      </S.Container>
      {isOpen && (
        <Modal isOpen={isOpen} closeModal={closeModal} buttonText="Close">
          TEST
        </Modal>
      )}
    </S.Wrapper>
  );
}

export default CurrencyDisplay;
