import React from 'react';
import styled from 'styled-components';

import { useAppSelector } from '../../../../utils/hooks';
import Select from '../../../Select/Select';
import Option from '../../../Select/Option';
import StatusBubble from './StatusBubble';

import { shortenWalletAddress } from '../../../../utils/common';

type EthAddressDisplayProps = {
  className?: string;
}

const EthAddressDisplay = ({ className }: EthAddressDisplayProps) => {
  const { ethAddress } = useAppSelector((state) => state.net);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === 'disconnect') {
      return;
    }
  }

  const addressText = ethAddress ? shortenWalletAddress(ethAddress) : 'Connect your wallet'
  return (
    <div className={className}>
      <StatusBubble className='address-status' status={ethAddress ? 1 : 0} />
      <Select value={'address'} onChange={handleChange}>
        <Option value='address'>{addressText}</Option>
      </Select>
    </div>
  );
}

export default styled(EthAddressDisplay)`
  max-width: 200px;
  position: relative;

  .address-status {
    position: absolute;
    top: calc(50% - 5px);
    left: 10px;
    cursor: pointer;
    pointer-events: none
  }

`;
