import React from 'react';
import styled from 'styled-components';

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
        <FormatAmount className="ftb-format-amount"
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
  flex-direction: column;
  gap: 4px;

  width: 302px;

  font-family: SF UI Text;
  font-style: normal;
  font-size: 16px;
  line-height: 100%;

  font-size: 13px;

  .sft-balance-text {
    color: ${props => props.theme.colors.main};
  }

  .ftb-format-amount {
    font-size: 11px;
  }
`;
