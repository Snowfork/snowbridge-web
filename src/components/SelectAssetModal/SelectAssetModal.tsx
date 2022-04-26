import React, { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { utils } from 'ethers';
import * as S from './SelectAssetModal.style';
import { updateSelectedAsset } from '../../redux/actions/bridge';
import { Asset, decimals, symbols } from '../../types/Asset';
import { SwapDirection } from '../../types/types';
import { useAppSelector } from '../../utils/hooks';

import Modal from '../Modal/Modal';
import { Heading } from '../Modal/Modal.style';

import Panel from '../Panel/Panel';
import { NonFungibleTokens } from './NonFungibleTokens';

import DOSButton from '../Button/DOSButton';
import TabButton from '../Button/TabButton';
import Input from '../Input/Input';
import { DISABLE_NFT_ASSETS } from '../../config';

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
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className={className}
    >
      <Heading>Select Asset</Heading>
      <Panel>
        <div style={{
          justifyContent: 'space-around',
          display: 'flex',
          flexDirection: 'row',
          gap: '5px'
        }}>
          <TabButton selected={(selectedTab === 0)} onClick={() => setSelectedTab(0)}>
            Fungible
          </TabButton>
          <TabButton selected={(selectedTab === 1)} onClick={() => setSelectedTab(1)} hidden={DISABLE_NFT_ASSETS}>
            Non-Fungible
          </TabButton>
        </div>
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
    </Modal>
  );
}

export default styled(SelectAssetModal)`
`;
