import {
  ListItemText, Collapse, ListItem,
} from '@material-ui/core';
import React, { useState } from 'react';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import styled from 'styled-components';

import Input from '../../Input/Input';
import DOSButton from '../../Button/DOSButton';

const TokenForm = styled.div`
  margin: auto 0;
  padding: 8px;

  * {
    width: 100%;
  }
`;

interface Props {
  onNFTSelected: (contract: string, ethId: string, polkadotId: string | undefined) => void;
}

const ManualInput = ({
  onNFTSelected
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState('');

  const handleTokenAddressChanged = (e: any) => {
    setSelectedTokenAddress(e.target.value);
  };

  const handleIdChanged = (e: any) => {
    setSelectedTokenId(e.target.value);
  };

  const selectNFT = () => {
    onNFTSelected(selectedTokenAddress, selectedTokenId, undefined)
  }

  return (
    <>
      <ListItem style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <ListItemText>Custom nft contract?</ListItemText>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <TokenForm>
          <label>Contract</label>
          <Input
            style={{ textAlign: 'left', width: 'calc(100% - 20px)' }}
            placeholder="Enter Contract Address"
            type="text" value={selectedTokenAddress} onChange={handleTokenAddressChanged} />
          <label>Token ID</label>
          <Input
            style={{ textAlign: 'left', width: 'calc(100% - 20px)' }}
            placeholder="Enter Token ID"
            type="text" value={selectedTokenId} onChange={handleIdChanged} />
          <DOSButton onClick={selectNFT}>Select</DOSButton>
        </TokenForm>
      </Collapse>
    </>
  );
};

export default ManualInput;
