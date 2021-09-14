import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import {
  Tabs,
  Tab,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { utils } from 'ethers';
import * as S from './SelectAssetModal.style';
import { updateSelectedAsset } from '../../redux/actions/bridge';
import { Asset, decimals, symbols } from '../../types/Asset';
import { SwapDirection } from '../../types/types';
import { useAppSelector } from '../../utils/hooks';

import Panel from '../Panel/Panel';
import { NonFungibleTokens } from './NonFungibleTokens';

import DOSButton from '../Button/DOSButton';
import Input from '../Input/Input';

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
  className?: string;
  open: boolean;
  onClose: () => void;
};

function SelectAssetModal({
  className,
  open,
  onClose,
}: Props): React.ReactElement<Props> {
  const [isOpen, setIsOpen] = useState(open);
  const [searchInput, setSearchInput] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const { assets, swapDirection } = useAppSelector((state) => state.bridge);
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
    <ReactModal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Select Token"
    >
      <Panel className={className}>
        <Panel>
          <S.Heading>Select Asset</S.Heading>
        </Panel>
        <Panel>
          <Tabs value={selectedTab} onChange={(event, newTab) => setSelectedTab(newTab)}>
            <Tab label="Fungible" />
            <Tab label="Non-Fungible" />
          </Tabs>
          {selectedTab === 0 && <div style={{ height: '334px' }}>
            <Input
              placeholder="Search for a token"
              style={{ textAlign: 'left', width: 'calc(100% - 20px)' }}
              onChange={handleInputChange} />
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
                        <button onClick={() => handleTokenSelection(asset)}>
                          <img src={asset.logoUri} alt={`${asset.name} icon`} />
                          <span>{symbols(asset, swapDirection).from} {getTokenBalance(asset)}</span>
                        </button>
                      </S.Token>
                    ),
                  )
              }
            </S.TokenList>
          </div>}
          {selectedTab === 1 && <div style={{ height: '334px' }}>
            <NonFungibleTokens handleTokenSelection={handleTokenSelection} />
          </div>}
        </Panel>
        <Panel>
          <DOSButton onClick={closeModal}>Close</DOSButton>
        </Panel>
      </Panel>
    </ReactModal>
  );
}

export default styled(SelectAssetModal)`
  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${props => props.theme.colors.transferPanelBorder};
  background: ${props => props.theme.colors.transferPanelBackground};
`;
