import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

import * as S from './TransactionListModal.style';
import TransactionItem from './TransactionItem';

import Modal from '../Modal';
import { useAppSelector } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { setShowTransactionListModal } from '../../redux/actions/bridge';

type Props = {
  open: boolean;
  className?: string;
};


function TransactionListModal({
  open, className,
}: Props): React.ReactElement<Props> {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(open);
  const { transactions } = useAppSelector((state) => state.transactions);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    dispatch(setShowTransactionListModal(false));
  }, [setIsOpen, dispatch]);

  useEffect(() => {
    if (open) {
      setIsOpen(true);
    } else {
      closeModal();
    }
  }, [open, setIsOpen, closeModal]);


  if (!isOpen) {
    return <div></div>;
  }


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
    >
      <S.Wrapper className={className}>
        <S.Heading>Transactions List</S.Heading>
        <S.List>
          {transactions.map((transaction) => (
            <TransactionItem
              transaction={transaction}
              key={transaction.hash}
            />
          ))}
        </S.List>
      </S.Wrapper>
    </Modal>
  );
}

export default styled(TransactionListModal)`
gap: 10px;
display: flex;
flex-direction: column;
min-width: 480px;
align-items: center;
`;
