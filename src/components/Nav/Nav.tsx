import React from 'react';
import * as S from './Nav.style';

import CurrencyDisplay from '../CurrencyDisplay';

import IconMetamask from '../../assets/images/icon-metamask.png';
import IconPolkadot from '../../assets/images/icon-polkadot.svg';

type Props = {
  polkadotAddress: string;
  ethAddress: string;
  ethBalance: string | undefined;
};

function Nav({
  polkadotAddress,
  ethAddress,
  ethBalance,
}: Props): React.ReactElement<Props> {
  let eBalance;

  if (!ethBalance) eBalance = '';
  else eBalance = ethBalance;

  return (
    <S.Wrapper>
      <S.Heading>Ethereum Bridge</S.Heading>
      <S.CurrencyList>
        <CurrencyDisplay
          balance={eBalance}
          currencyCode="ETH"
          address={ethAddress}
          icon={IconMetamask}
          provider="Metamask"
        />

        <CurrencyDisplay
          balance={0.5}
          currencyCode="PolkaETH"
          address={polkadotAddress}
          icon={IconPolkadot}
          provider="Polkadot.js"
        />
      </S.CurrencyList>
    </S.Wrapper>
  );
}

export default Nav;
