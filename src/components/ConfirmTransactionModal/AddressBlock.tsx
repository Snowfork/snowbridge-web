import React from 'react';

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
      <div>
        {chainName}
      </div>
      <div>
        {type === 'sending' ? 'Sending' : 'Receiving'} Address
      </div>
      <div>
        {
          shortenWalletAddress(
            address,
          )
        }
      </div>
    </div >
  );
}

export default AddressBlock;
