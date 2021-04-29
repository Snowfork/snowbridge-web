import React from 'react';
import { useSelector } from 'react-redux';
import { BLOCK_EXPLORER_URL } from '../../config';
import {
  TransactionStatus,
} from '../../redux/reducers/transactions';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { RootState } from '../../redux/reducers';
import { decimals, symbols } from '../../types/Asset';

type Props = {
    isOpen: boolean,
    closeModal: any
}

const PendingTransactionsModal = ({ isOpen, closeModal }: Props): React.ReactElement<Props> => {
  const transactions = useSelector((state: RootState) => state.transactions);
  const bridge = useSelector((state: RootState) => state.bridge);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      buttonText="x"
    >
      <div>
        {/* submitting - waiting for confirmation in metamask */}
        {transactions.pendingTransaction?.status
                === TransactionStatus.SUBMITTING_TO_CHAIN ? (
                  <div>
                    <div style={{ width: '40px', height: '40px' }}>
                      <LoadingSpinner />
                    </div>
                    <h3>Waiting for transaction to be submitted</h3>
                    <h4>
                      Bridging
                      {' '}
                      {bridge.depositAmount}
                      {' '}
                      {
                      symbols(
                        transactions.pendingTransaction.asset,
                        bridge.swapDirection,
                      ).from
                      }
                      {' '}
                      to
                      {' '}
                      {bridge.depositAmount}
                      {' '}
                      {
                      symbols(
                        transactions.pendingTransaction.asset,
                        bridge.swapDirection,
                      ).to
                      }
                    </h4>
                    <div>Confirm this transaction in your wallet</div>
                  </div>
            ) : null}
        {/* submitted to ethereum - waiting to reach transaction confirmation threshold  */}
        {
                transactions.pendingTransaction?.status
                    === TransactionStatus.WAITING_FOR_CONFIRMATION ? (
                      <div>
                        <h3>Transaction Submitted</h3>
                        {/* link to etherscan */}
                        { transactions.pendingTransaction.chain === 'eth' ? (
                          <h4>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`${BLOCK_EXPLORER_URL}/tx/${transactions.pendingTransaction.hash}`}
                            >
                              View on etherscan
                            </a>
                          </h4>
                        ) : null}
                      </div>
                ) : null
            }
        {/* error */}
        {transactions.pendingTransaction?.status
                === TransactionStatus.REJECTED ? (
                  <div>
                    <h3>Error</h3>
                    <h4>Transaction rejected.</h4>
                    <p>{transactions.pendingTransaction.error}</p>
                  </div>
            ) : null}
      </div>
    </Modal>
  );
};

export default PendingTransactionsModal;
