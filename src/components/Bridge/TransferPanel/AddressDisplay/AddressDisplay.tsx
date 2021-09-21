import React from 'react';
import styled from 'styled-components';

import { Chain } from '../../../../types/types';
import EthAddressDisplay from './EthAddressDisplay';
import PolkadotAddressDisplay from './PolkadotAddressDisplay';

type AddressDisplayProps = {
  className?: string;
  chain: Chain,
}

const AddressDisplay = ({ chain, className }: AddressDisplayProps) => {
  switch (chain) {
    case Chain.ETHEREUM:
      return <EthAddressDisplay className={className} />;
    case Chain.POLKADOT:
      return <PolkadotAddressDisplay className={className} />;
  }
}

export default styled(AddressDisplay)`
`;
