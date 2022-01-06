import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import {
  setShowConfirmTransactionModal, setSwapDirection,
  updateSelectedAsset,
} from '../../../redux/actions/bridge';
import { ethereumProviderSelector, isNetworkPermittedSelector } from '../../../redux/reducers/net';
import { SwapDirection, Chain } from '../../../types/types';

import {
  dotSelector,
  etherSelector,
  tokenBalancesByNetwork,
} from '../../../redux/reducers/bridge';
import { getChainsFromDirection } from '../../../utils/common';
import { AssetType, decimals } from '../../../types/Asset';
import { useAppSelector } from '../../../utils/hooks';
import SelectedFungibleToken from './SelectedFungibleToken';
import { SelectedNFT } from './SelectedNFT';

import Panel from '../../Panel/Panel';

import ChainTypeDisplay from './ChainTypeDisplay';
import FeeInfo from './FeeInfo';
import AddressDisplay from './AddressDisplay/AddressDisplay';
import DirectionBadge from './DirectionBadge';

import DOSButton from '../../Button/DOSButton';
import TransactionListButton from '../../Button/TransactionListButton';

import SwitchButton from '../../Button/SwitchButton';
import FungibleTokenBalance from './FungibleTokenBalance';


import { PERMITTED_METAMASK_NETWORK, PERMITTED_METAMASK_NETWORK_ID } from '../../../config';

const INSUFFICIENT_GAS_ERROR = 'Insufficient gas';

type Props = {
  className?: string;
  setShowAssetSelector: (show: boolean) => void,
}

const TransferPanel = ({ className, setShowAssetSelector }: Props) => {
  // state
  const tokenBalances = useAppSelector(tokenBalancesByNetwork);
  const dot = useAppSelector(dotSelector);
  const ether = useAppSelector(etherSelector);
  const isMetamaskNetworkPermitted = useAppSelector(isNetworkPermittedSelector);
  const ethereumProvider = useAppSelector(ethereumProviderSelector);

  const polkadotGasBalance = dot?.balance?.polkadot;
  const ethereumGasBalance = ether?.balance?.eth;

  const [errors, setErrors] = useState<{ balance?: string, asset?: string, fee?: string }>({
    balance: undefined,
    asset: undefined,
    fee: undefined,
  });

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
    assets,
  } = useAppSelector((state) => state.bridge);

  const dispatch = useDispatch();
  const decimalMap = decimals(selectedAsset, swapDirection);

  // check the user has enough gas for the transaction
  useEffect(() => {
    if (!selectedAsset) {
      dispatch(updateSelectedAsset(assets[0]));
    }

    let hasEnoughGas;

    // check eth balance for eth -> polkadot transactions
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      hasEnoughGas = Number.parseFloat(ethereumGasBalance) > 0;
    } else {
      // check DOT balance for polkadot -> eth transactions
      hasEnoughGas = Number.parseFloat(polkadotGasBalance) > 0;
    }

    if (!hasEnoughGas) {
      setErrors((errors) => ({ ...errors, gas: INSUFFICIENT_GAS_ERROR }));
    } else {
      setErrors(
        (errors) => ({ ...errors, gas: undefined }),
      );
    }
  }, [swapDirection, selectedAsset, ethereumGasBalance, polkadotGasBalance]);

  const setAssetError = (assetError: string) => {
    setErrors((errors) => ({ ...errors, asset: assetError }));
  };

  const setFeeError = (feeError: string) => {
    setErrors((errors) => ({ ...errors, fee: feeError }));
  };

  const handleTransferClicked = () => {
    dispatch(setShowConfirmTransactionModal(true));
  };

  const changeTransactionDirection = () => {
    if (swapDirection === SwapDirection.EthereumToPolkadot) {
      dispatch(setSwapDirection(SwapDirection.PolkadotToEthereum));
    } else {
      dispatch(setSwapDirection(SwapDirection.EthereumToPolkadot));
    }
  };

  const switchNetwork = async () => {
    if (ethereumProvider) {
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: PERMITTED_METAMASK_NETWORK_ID }],
        });
      } catch (error) {
        // Silent catch
      }
    }
  };

  const handleAssetSelect = () => {
    if (isMetamaskNetworkPermitted) {
      setShowAssetSelector(true);
    } else {
      switchNetwork();
    }
  };

  const selectedAssetSourceChain = selectedAsset?.chain === Chain.ETHEREUM ? 0 : 1;
  const selectedAssetValid = selectedAsset?.type === 0
    || (selectedAsset?.type === 1 && selectedAssetSourceChain === swapDirection);
  const errorText = (selectedAsset?.type === AssetType.ERC20 && errors.asset) || errors.balance || errors.fee;

  const isDepositDisabled = !!errorText
    || (selectedAsset?.type === AssetType.ERC20 && Number.parseFloat(depositAmount) <= 0) || !selectedAssetValid;

  const chains = getChainsFromDirection(swapDirection);

  const renderActionButton = () => {
    if (!isMetamaskNetworkPermitted) {
      return (
        <DOSButton
          onClick={switchNetwork}
        >
          {`Switch to ${PERMITTED_METAMASK_NETWORK} network`}
        </DOSButton>
      );
    }

    return (
      <DOSButton
        onClick={handleTransferClicked}
        disabled={isDepositDisabled}
      >
        {errorText || 'Transfer Asset(s)'}
      </DOSButton>
    );
  };

  return (
    <Panel className={className}>
      <div className="selected-asset-section">
        {selectedAsset?.type === 0
          && <SelectedFungibleToken openAssetSelector={handleAssetSelect} setError={setAssetError} />}
        {selectedAsset?.type === 1
          && <SelectedNFT openAssetSelector={handleAssetSelect} />}
      </div>
      <Panel className="chain-direction-display-panel">
        <div className="chain-direction-display">
          <DirectionBadge direction="From" />
          <ChainTypeDisplay chain={chains.from} />
          <AddressDisplay className="address-display" chain={chains.from} />
        </div>
        {selectedAsset?.type === 0 && (
          <FungibleTokenBalance
            amount={tokenBalances.sourceNetwork}
            decimals={decimalMap.from}
          />
        )}
      </Panel>

      <div>
        <SwitchButton onClick={changeTransactionDirection} />
      </div>

      <Panel className="chain-direction-display-panel">
        <div className="chain-direction-display">
          <DirectionBadge direction="To" />
          <ChainTypeDisplay chain={chains.to} />
          <AddressDisplay className="address-display" chain={chains.to} />
        </div>
        {selectedAsset?.type === 0
          && (
            <FungibleTokenBalance
              amount={tokenBalances.destinationNetwork}
              decimals={decimalMap.to}
            />
          )}
      </Panel>
      <FeeInfo setError={setFeeError} />
      {renderActionButton()}
      <TransactionListButton />
    </Panel>
  );
};

export default styled(TransferPanel)`
  width: 520px;
  align-items: center;
  gap: 15px;

  border: 1px solid ${(props) => props.theme.colors.transferPanelBorder};
  background: ${(props) => props.theme.colors.transferPanelBackground};

  .selected-asset-section {
    margin-bottom: 10px;
  }
  .chain-direction-display-panel {
    width: auto;
    min-width: 370px;
  }

  .chain-direction-display {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    gap: 5px;
    width: auto;
  }

  .address-display {
    margin-left: 5px;
  }
`;
