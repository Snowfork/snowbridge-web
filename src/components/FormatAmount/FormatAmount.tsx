import React from 'react';
import { utils } from 'ethers';

interface Props {
    amount: string,
    decimals: number
}

export default function FormatAmount({ amount, decimals }: Props): React.ReactElement {
  return <>{utils.formatUnits(amount, decimals)}</>;
}
