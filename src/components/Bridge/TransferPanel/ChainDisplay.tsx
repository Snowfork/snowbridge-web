import React from 'react';
import styled from 'styled-components';

import { Chain } from '../../../types/types';
import { getChainName, getChainImage } from '../../../utils/common';

type ChainDisplayProps = {
  className?: string;
  mini?: boolean;
  chain: Chain,
}

const ChainDisplay = ({ chain, className }: ChainDisplayProps) => {
  const chainName = getChainName(chain);
  const chainImage = getChainImage(chain);
  return (
    <span className={className}>
      <img style={{ width: '24px', height: '24px' }} src={chainImage} alt="" />
      <span>
        {chainName}
      </span>
    </span>
  );
}

export default styled(ChainDisplay)`
  color: ${props => props.theme.colors.secondary};
  display: flex;
  flex-direction: ${props => props.mini ? 'column' : 'row'};
  justify-content: left;
  align-items: center;
  font-size: ${props => props.mini ? '10px' : 'undefined'};
  gap: ${props => props.mini ? '5px' : 'undefined'};
`;
