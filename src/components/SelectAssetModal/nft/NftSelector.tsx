/* eslint-disable react/no-array-index-key */
import {
  Collapse, List, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core';
import React, { useState } from 'react';

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ManualInput from './ManualInput';
import { OwnedNft } from '../../../types/types';
import { SwapDirection } from '../../../types/types';

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
        <List>
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
        </List>
      </Collapse>
    </>
  );
};

interface Props {
  sourceChain: SwapDirection,
  onNFTSelected: (contract: string, ethId: string, polkadotId: string | undefined) => void;
  ownedNfts: { [address: string]: OwnedNft[] };
}

const NftSelector = ({
  sourceChain,
  onNFTSelected,
  ownedNfts,
}: Props) => {

  const handleTokenSelected = (token: OwnedNft) => {
    onNFTSelected(token.address, token.ethId!, token.polkadotId);
  };

  return (
    <div>
      <List>
        {
          Object.keys(ownedNfts).map((contract) => <TokensForContract contract={contract} tokens={ownedNfts[contract]} key={contract} onSelected={handleTokenSelected} />)
        }
      </List>

      {sourceChain === SwapDirection.EthereumToPolkadot && <ManualInput onNFTSelected={onNFTSelected} />}

    </div>
  );
};
export default NftSelector;
