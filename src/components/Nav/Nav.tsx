import React, { useState, useEffect } from 'react';
import * as S from './Nav.style';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { ApiPromise } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

import CurrencyDisplay from '../CurrencyDisplay';

import IconMetamask from '../../assets/images/icon-metamask.png';
import IconPolkadot from '../../assets/images/icon-polkadot.svg';

import Net from '../../net/';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

type Props = {
  net: Net;
  polkadotApi: ApiPromise;
};

function Nav({ net, polkadotApi }: Props): React.ReactElement<Props> {
  const [polkadotDefaultAcc, setPolkadotDefaultAcc] = useState(String);

  // Get default Polkadotjs Account
  useEffect(() => {
    const exe = async () => {
      const extensions = await web3Enable('Ethereum Bridge');

      if (extensions.length === 0) {
        return;
      }

      const allAccounts = await web3Accounts();
      setPolkadotDefaultAcc(allAccounts[0].address);
    };

    exe();
  }, []);

  return (
    <S.Wrapper>
      <S.Heading>Ethereum Bridge</S.Heading>
      <S.CurrencyList>
        <CurrencyDisplay
          balance={net!.eth!.account!.balance!}
          currencyCode="ETH"
          address={net!.eth!.account!.address!}
          icon={IconMetamask}
          provider="Metamask"
        />
        )
        <CurrencyDisplay
          balance={0.5}
          currencyCode="PolkaETH"
          address={polkadotDefaultAcc}
          icon={IconPolkadot}
          provider="Polkadot.js"
        />
      </S.CurrencyList>
    </S.Wrapper>
  );
}

export default Nav;
