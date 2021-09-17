import React from 'react';
import styled from 'styled-components';

import { getChainName, shortenWalletAddress } from '../../utils/common';
import { Chain } from '../../types/types';

type Props = {
  className?: string;
  type: string;
  chain: Chain;
  address: string;
};

function AddressBlock({
  className,
  type,
  chain,
  address
}: Props): React.ReactElement<Props> {

  const chainName = getChainName(chain);

  return (
    <div className={className}>
      <div className="address-block-direction">
        {type === 'sending' ? 'Sending' : 'Receiving'} Address
      </div>
      <div className="address-block-chain-name">
        {chainName}
      </div>
      <div className="address-block-chain-address">
        {
          shortenWalletAddress(
            address,
          )
        }
      </div>
    </div >
  );
}

export default styled(AddressBlock)`
  border: solid 1px ${props => props.theme.colors.main};
  padding: 10px;
  height: 80px;
  width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .address-block-direction {
    color: ${props => props.theme.colors.main};
    font-size: 12px;
  }

  .address-block-chain-name {
    font-size: 14px;
  }

  .address-block-chain-address {
    font-size: 16px;
  }
  `;
