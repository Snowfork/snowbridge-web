/* eslint-disable react/no-array-index-key */
import {
  Collapse, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core';
import React, { useState } from 'react';

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ManualInput from './ManualInput';
import { OwnedNft } from '../../../types/types';
import { SwapDirection } from '../../../types/types';

import * as S from '../SelectAssetModal.style';
import ExternalLink from '../../Link/ExternalLink';

import { getChainsFromDirection } from '../../../utils/common';
import { Chain } from '../../../types/types';

const TokensForContract = (
  {
    contract,
    tokens,
    onSelected,
  }:
    {
      contract: string,
      tokens: OwnedNft[],
      onSelected: (token: OwnedNft) => void
    },
) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

  const handleTokenClicked = (i: number) => {
    setSelectedIndex(i);
    onSelected(tokens[i]);
  };

  return (
    <>
      <ListItem key={contract} onClick={() => setIsOpen(!isOpen)}>
        <ListItemText>
          {tokens[0]?.name}
          {' '}
          (
          {tokens.length}
          )
        </ListItemText>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <ul>
          {
            tokens.map((ownedNft, i) => (
              <ListItem dense button key={ownedNft.ethId + ownedNft.address + i} onClick={() => handleTokenClicked(i)}>
                <ListItemIcon>
                  <input type="radio" name={contract} id={ownedNft.ethId} value={ownedNft.ethId} checked={i === selectedIndex} onChange={() => { console.log('radio changed'); }} />
                </ListItemIcon>
                <ListItemText>
                  {ownedNft.ethId}
                </ListItemText>
              </ListItem>
            ))
          }
        </ul>
      </Collapse>
    </>
  );
};

interface Props {
  swapDirection: SwapDirection,
  onNFTSelected: (contract: string, ethId: string, polkadotId: string | undefined) => void;
  ownedNfts: { [address: string]: OwnedNft[] };
}

const NftSelector = ({
  swapDirection,
  onNFTSelected,
  ownedNfts,
}: Props) => {

  const handleTokenSelected = (token: OwnedNft) => {
    onNFTSelected(token.address, token.ethId!, token.polkadotId);
  };

  const sourceChain = getChainsFromDirection(swapDirection).from;

  return (
    <div>
      <S.TokenList>
        {
          Object.keys(ownedNfts).map((contract) => <TokensForContract contract={contract} tokens={ownedNfts[contract]} key={contract} onSelected={handleTokenSelected} />)
        }
        {Object.keys(ownedNfts).length === 0 && sourceChain === Chain.ETHEREUM && <div style={{ fontSize: '12px', maxWidth: '300px' }}>
          Looks like you don't have any enumerable ERC721 NFTs :(
          You can mint some test ones using this demo app: <ExternalLink href="https://nft-mint-demo.netlify.app/">NFT Minter</ExternalLink>
          , or enter a custom ERC721 address and ID for non-enumerable tokens.
        </div>}
        {Object.keys(ownedNfts).length === 0 && sourceChain === Chain.POLKADOT && <div style={{ fontSize: '12px', maxWidth: '300px' }}>
          Looks like you don't have any NFTs on Polkadot. Try bridge some over!
        </div>}
        {sourceChain === Chain.ETHEREUM && <ManualInput onNFTSelected={onNFTSelected} />}
      </S.TokenList >
    </div >
  );
};
export default NftSelector;
