import React, { useState, useEffect } from 'react';
import * as S from './Nav.style';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

import CurrencyDisplay from '../CurrencyDisplay';

import IconMetamask from '../../assets/images/icon-metamask.png';
import IconPolkadot from '../../assets/images/icon-polkadot.svg';

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
  web3: Web3;
  polkadotApi: ApiPromise;
};

function Nav({ web3, polkadotApi }: Props): React.ReactElement<Props> {
  const [web3DefaultAcc, setDefaultWeb3Acc] = useState(String);
  const [web3Balance, setWeb3Balance] = useState(String);

  const [polkadotDefaultAcc, setPolkadotDefaultAcc] = useState(String);

  // Get default Web3 Account
  useEffect(() => {
    const fetchAccounts = async () => {
      const accs = await web3.eth.getAccounts();
      const defaultAcc = accs[0];

      web3.eth.defaultAccount = defaultAcc;
      setDefaultWeb3Acc(defaultAcc);
    };

    fetchAccounts();
  }, [web3.eth]);

  // Get Web3 Balance
  useEffect(() => {
    const exe = async () => {
      if (web3DefaultAcc !== undefined && web3DefaultAcc.toString() !== '') {
        const currBalance = await web3.eth.getBalance(
          web3DefaultAcc.toString(),
        );
        setWeb3Balance(web3.utils.fromWei(currBalance, 'ether'));
      }
    };

    exe();
  });

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
        {web3DefaultAcc && web3Balance && (
          <CurrencyDisplay
            balance={web3Balance}
            currencyCode="ETH"
            address={web3DefaultAcc}
            icon={IconMetamask}
            provider="Metamask"
          />
        )}
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
