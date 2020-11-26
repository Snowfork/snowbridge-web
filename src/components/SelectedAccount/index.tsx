import React from 'react';
import Net from '../../net/';
import Identicon from '@polkadot/react-identicon';
import { shortenWalletAddress } from '../../utils/common';

type Props = {
  address: string;
};

export default function SelectedAccount({ address }: Props) {
  const size = 32;
  const theme = 'polkadot';

  return (
    <div>
      <Identicon value={address} size={size} theme={theme} />
      <span style={{ marginLeft: 15 }}>{shortenWalletAddress(address)}</span>
    </div>
  );
}
