import {
  Button, InputLabel, Input, ListItemText, Collapse, ListItem,
} from '@material-ui/core';
import React, { useState } from 'react';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import styled from 'styled-components';

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
        <ListItemText>Dont see your nft?</ListItemText>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <TokenForm>
          <InputLabel htmlFor="contract">Contract</InputLabel>
          <Input type="text" name="contract" value={selectedTokenAddress} onChange={handleTokenAddressChanged} />
          <InputLabel htmlFor="token">Token ID</InputLabel>
          <Input type="text" name="token" value={selectedTokenId} onChange={handleIdChanged} />
        </TokenForm>
        <Button onClick={selectNFT}>Select</Button>
      </Collapse>
    </>
  );
};

export default ManualInput;
