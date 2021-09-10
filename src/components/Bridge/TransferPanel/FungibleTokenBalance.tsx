import React, { useEffect } from 'react';
import styled from 'styled-components';

import { decimals } from '../../../types/Asset';
import FormatAmount from '../../FormatAmount';

type Props = {
  className?: string;
  amount: string,
  decimals: number,
}

const SelectedFungibleToken = ({ className, amount, decimals }: Props) => {
  return (
    <div className={className}>
      <span className={'sft-balance-text'}>
        Balance
      </span >
      <span>
        <FormatAmount
          amount={amount}
          decimals={decimals}
        />
      </span>
    </div >
  );
};

export default styled(SelectedFungibleToken)`
  justify-content: space-between;
  gap: 10px;
  display: flex;
  width: 302px;

  font-family: SF UI Text;
  font-style: normal;
  font-size: 16px;
  line-height: 100%;
`;
