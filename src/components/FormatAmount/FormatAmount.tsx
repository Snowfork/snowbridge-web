import React from 'react';
import { utils } from 'ethers';
import styled from 'styled-components';

interface Props {
  className?: string;
  amount: string,
  decimals: number
}

function FormatAmount({ className, amount = '0', decimals = 0 }: Props): React.ReactElement {
  let formattedAmount = amount;

  try {
    formattedAmount = utils.formatUnits(amount, decimals);
  } catch (e) {
    console.log('error formatting amount', amount, decimals);
  }

  return <span className={className}>{formattedAmount}</span>;
}

export default styled(FormatAmount)`
`;
