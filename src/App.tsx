// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// external imports
import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';

// local imports and components
import Bridge from './components/Bridge/Bridge';
import Nav from './components/Nav';
import Net, { isConnected } from './net';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setNet } from './redux/actions';
import { NetState } from './redux/reducers/net';
import {
	TransactionsState,
	TransactionStatus,
} from './redux/reducers/transactions';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import { BLOCK_EXPLORER_URL, PERMITTED_METAMASK_NETWORK } from './config';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#root');

type Props = {
	net: NetState;
	transactions: TransactionsState;
};

function BridgeApp(props: Props) {
	const { net, transactions } = props;

	const dispatch = useDispatch();
	const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

	// Start Network
	useEffect(() => {
		const start = async () => {
			const net = await new Net();
			await net.start(dispatch);

			dispatch(setNet(net));
		};

		start();
	}, [dispatch]);

	// open modal for pending transation
	useEffect(() => {
		if (transactions.pendingTransaction) {
			setIsPendingModalOpen(true);
		}
	}, [transactions.pendingTransaction, dispatch]);

	const closeModal = () => {
		setIsPendingModalOpen(false);
	};

	// Check if Network has been started
	if (!isConnected(net.client)) {
		return <p style={{ textAlign: 'center' }}>Connecting Network</p>;
	}

	if (
		net.metamaskNetwork.toLowerCase() !==
		PERMITTED_METAMASK_NETWORK.toLowerCase()
	) {
		return (
			<p style={{ textAlign: 'center', color: '#fff' }}>
				Please select ${PERMITTED_METAMASK_NETWORK} network in Metamask extension
			</p>
		);
	}

	const ethToSnow = transactions?.pendingTransaction?.chain === 'eth';
	const baseTokenSymbol = transactions?.pendingTransaction?.token.symbol;
	const snowTokenSymbol = `Snow${baseTokenSymbol}`;
	return (
		<main>
			<Nav net={net.client} transactions={props.transactions} />
			<Bridge
				net={net.client!}
				selectedEthAccount={net.client.ethAddress}
			/>
			<Modal
				isOpen={isPendingModalOpen}
				closeModal={closeModal}
				buttonText="x"
			>
				<div>
					{/* submitting - waiting for confirmation in metamask */}
					{transactions.pendingTransaction?.status ===
						TransactionStatus.SUBMITTING_TO_CHAIN ? (
						<div>
							<div style={{ width: '40px', height: '40px' }}>
								<LoadingSpinner />
							</div>
							<h3>Waiting for transaction to be submitted</h3>
							<h4>
								Bridging
								{' '}
								{transactions.pendingTransaction?.amount}
								{' '}
								{ethToSnow ? baseTokenSymbol : snowTokenSymbol}
								{' '}
								to
								{' '}
								{transactions.pendingTransaction?.amount}
								{' '}
								{ethToSnow ? snowTokenSymbol : baseTokenSymbol}
							</h4>
							<div>Confirm this transaction in your wallet</div>
						</div>
					) : null}
					{/* submitted to ethereum - waiting to reach transaction confirmation threshold  */}
					{transactions.pendingTransaction?.status ===
						TransactionStatus.WAITING_FOR_CONFIRMATION ? (
						<div>
							<h3>Transaction Submitted</h3>
							{/* link to etherscan */}
							{ transactions.pendingTransaction.chain === 'eth' ? <h4>
								<a
									target="_blank"
									rel="noopener noreferrer"
									href={`${BLOCK_EXPLORER_URL}/tx/${transactions.pendingTransaction.hash}`}
								>
									View on etherscan
									</a>
							</h4> : null}
						</div>
					) : null}
					{/* error */}
					{transactions.pendingTransaction?.status ===
						TransactionStatus.REJECTED ? (
						<div>
							<h3>Error</h3>
							<h4>Transaction rejected.</h4>
						</div>
					) : null}
				</div>
			</Modal>

			<ToastContainer autoClose={10000} />
		</main>
	);

}

const mapStateToProps = (
	state: Props,
): {
	net: NetState;
	transactions: TransactionsState;
} => {
	return {
		net: state.net,
		transactions: state.transactions,
	};
};

export default connect(mapStateToProps)(BridgeApp);
