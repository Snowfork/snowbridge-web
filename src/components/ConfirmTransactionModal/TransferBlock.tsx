import React from 'react';
import styled from 'styled-components';

import { assetToString } from '../../utils/common';
import AddressBlock from './AddressBlock';
import { Asset } from '../../types/Asset';

type Props = {
  className?: string;
  addresses: any;
  chains: any;
  asset: Asset;
  amount: string;
};

function TransferBlock({
  className,
  addresses,
  chains,
  asset,
  amount
}: Props): React.ReactElement<Props> {

  return (
    <div className={className}>
      <div className="confirm-modal-asset-name">
        {assetToString(asset, amount)}
      </div>
      <div className="confirm-modal-address-blocks">
        <AddressBlock
          type="sending"
          chain={chains.from}
          address={addresses.from}
        />
        <div>--&#62;---&#62;---&#62;--</div>
        <AddressBlock
          type="receiving"
          chain={chains.to}
          address={addresses.to}
        />
      </div>
    </div>
  );
}

export default styled(TransferBlock)`
  padding-bottom: 10px;

.confirm-modal-asset-name {
  font-size: 16px;
  text-align: center;
  width: 100%;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.confirm-modal-address-blocks {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
`;
