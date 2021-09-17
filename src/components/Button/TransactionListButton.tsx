import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../utils/hooks';
import { useDispatch } from 'react-redux';

import PillButton from './PillButton';
import LoadingSpinner from '../LoadingSpinner';

import { transactionsInProgressSelector } from '../../redux/reducers/transactions';
import { setShowTransactionListModal } from '../../redux/actions/bridge';


type Props = {
  className?: string;
}

const TransactionListButton = ({ className }: React.PropsWithChildren<Props>) => {
  const dispatch = useDispatch();
  const transactionsInProgress = useAppSelector(transactionsInProgressSelector);
  const { transactions } = useAppSelector((state) => state.transactions);

  const openTransactionsList = () => {
    dispatch(setShowTransactionListModal(true));
  };

  const buttonNumber = transactionsInProgress.length === 0 ? transactions.length : transactionsInProgress.length;
  const buttonText = transactionsInProgress.length === 0 ? 'Past' : 'Pending'
  return (
    <div className={className}>
      <PillButton onClick={openTransactionsList}>
        {buttonNumber} {buttonText} Transactions&nbsp;
        {
          transactionsInProgress.length > 0
          && <LoadingSpinner spinnerHeight="10px" spinnerWidth="10px" />
        }
      </PillButton>
    </div>
  );
};

export default styled(TransactionListButton)`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;
