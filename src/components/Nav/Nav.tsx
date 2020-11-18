import React, { useState, useEffect } from 'react';
import * as S from './Nav.style';

import CurrencyDisplay from '../CurrencyDisplay';

import IconMetamask from '../../assets/images/icon-metamask.png';
import IconPolkadot from '../../assets/images/icon-polkadot.svg';

import Net from '../../net/';

type Props = {
  net: Net;
};

function Nav({ net }: Props): React.ReactElement<Props> {
  const [polkadotAddress, setPolkadotAddress] = useState(String);
  const [ethAddress, setEthAddress] = useState(String);

  useEffect(() => {
    const await_polkadotAddress = async () => {
      let address = await net?.polkadot?.get_account();

      if (!address) {
        setPolkadotAddress('');
      } else {
        setPolkadotAddress(address);
      }
    };

    const await_ethAddress = async () => {
      let address = await net?.eth?.get_account();

      if (!address) {
        setEthAddress('');
      } else {
        setEthAddress(address);
      }
    };

    await_polkadotAddress();
    await_ethAddress();
  }, [net]);

  return (
    <S.Wrapper>
      <S.Heading>Ethereum Bridge</S.Heading>
      <S.CurrencyList>
        <CurrencyDisplay
          balance={net?.eth?.account?.balance!}
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
