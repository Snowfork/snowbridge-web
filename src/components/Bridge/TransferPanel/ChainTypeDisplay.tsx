import React from 'react';
import styled from 'styled-components';

import { Chain } from '../../../types/types';
import ChainDisplay from './ChainDisplay';
import ParachainDisplay from './ParachainDisplay';

type ChainTypeDisplayProps = {
  chain: Chain,
}

const ChainTypeDisplay = ({ chain }: ChainTypeDisplayProps) => {
  switch (chain) {
    case Chain.ETHEREUM:
      return <ChainDisplay chain={chain} />;
    default:
      return <ParachainDisplay  />;
  }
}

export default styled(ChainTypeDisplay)`
`;
