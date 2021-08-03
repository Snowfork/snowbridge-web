import { InputLabel, Input } from '@material-ui/core';
import React from 'react';

interface Props {
  contract: string,
  onContractChanged: (c: string) => void,
  id: string,
  onIdChanged: (id: string) => void
}

const ManualInput = ({
  contract,
  id,
  onContractChanged,
  onIdChanged,
}: Props) => (

  <div>
    <p>Dont see your nft?</p>
    <InputLabel htmlFor="contract">Contract</InputLabel>
    <Input type="text" name="contract" value={contract} onChange={(e) => onContractChanged(e.target.value)} />
    <InputLabel htmlFor="token">Token</InputLabel>
    <Input type="text" name="token" value={id} onChange={(e) => onIdChanged(e.target.value)} />

  </div>
);

export default ManualInput;
