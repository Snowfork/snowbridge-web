import React from 'react';
import { utils } from 'ethers';

interface Props {
    amount: string,
    decimals: number
}

export default function FormatAmount({ amount, decimals }: Props): React.ReactElement {
  let formattedAmount = amount;

  try {
    formattedAmount = utils.formatUnits(amount, decimals);
  } catch (e) {
    console.log('error formatting amount', amount, decimals);
  }

  return <>{formattedAmount}</>;
}
