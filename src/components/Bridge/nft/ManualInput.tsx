import {
  InputLabel, Input, ListItemText, Collapse, ListItem,
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
  onContractChanged: (c: string) => void,
  onIdChanged: (id: string) => void
}

const ManualInput = ({
  onContractChanged,
  onIdChanged,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('0x4283d8996E5a7F4BEa58c6052b1471a2a9524C87');
  const [selectedTokenId, setSelectedTokenId] = useState('3');

  const handleTokenAddressChanged = (e: any) => {
    setSelectedTokenAddress(e.target.value);
    onContractChanged(e.target.value);
  };

  const handleIdChanged = (e: any) => {
    setSelectedTokenId(e.target.value);
    onIdChanged(e.target.value);
  };

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
          <InputLabel htmlFor="token">Token</InputLabel>
          <Input type="text" name="token" value={selectedTokenId} onChange={handleIdChanged} />
        </TokenForm>
      </Collapse>
    </>
  );
};

export default ManualInput;
