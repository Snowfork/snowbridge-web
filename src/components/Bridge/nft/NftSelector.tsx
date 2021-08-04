/* eslint-disable react/no-array-index-key */
import {
  Button, Collapse, List, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core';
import React, { useState } from 'react';

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ManualInput from './ManualInput';
import { OwnedNft } from '../../../types/types';

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
  onClick: (contract: string, id: string) => void;
  buttonText: string;
  ownedNfts: { [address: string]: OwnedNft[] };
}

const NftSelector = ({
  onClick,
  buttonText,
  ownedNfts,
}: Props) => {
  const [selectedContractAddress, setSelectedContractAddress] = useState('0x4283d8996E5a7F4BEa58c6052b1471a2a9524C87');
  const [selectedTokenId, setSelectedTokenId] = useState('3');

  const handleContractChanged = (contract: string) => {
    setSelectedContractAddress(contract);
  };

  const handleIdChanged = (id: string) => {
    setSelectedTokenId(id);
  };

  const handleTokenSelected = (token: OwnedNft) => {
    handleIdChanged(token.ethId!);
    handleContractChanged(token.address);
  };

  const handleTransfer = () => {
    onClick(selectedContractAddress, selectedTokenId);
  };

  return (
    <div>
      <List>
        {
          Object.keys(ownedNfts).map((contract) => <TokensForContract contract={contract} tokens={ownedNfts[contract]} key={contract} onSelected={handleTokenSelected} />)
        }
      </List>

      <ManualInput onContractChanged={handleContractChanged} onIdChanged={handleIdChanged} />

      <Button
        variant="contained"
        size="large"
        color="primary"
        onClick={handleTransfer}
        style={{ margin: '0 auto' }}
      >
        {buttonText}
      </Button>

    </div>
  );
};
export default NftSelector;
