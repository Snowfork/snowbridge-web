import React, { useState } from 'react';
import * as S from './Nav.style';

import {
  formatToDecimalString,
  shortenWalletAddress,
} from '../../utils/common';

import Modal from '../Modal';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

type Props = {
  polkadotAddress: string;
  ethAddress: string;
  ethBalance: string | undefined;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);

function Nav({
  polkadotAddress,
  ethAddress,
  ethBalance,
}: Props): React.ReactElement<Props> {
  const classes = useStyles();

  const [polkadotAccIndex, setPolkadotAccIndex] = useState(0);

  let eBalance;

  if (!ethBalance) eBalance = '';
  else eBalance = ethBalance;

  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPolkadotAccIndex(event.target.value as number);
  };

  const polkadotAccs = [{ address: '123' }, { address: '345' }];

  return (
    <S.Wrapper>
      {console.log(ethAddress)}
      <S.Heading>Ethereum Bridge</S.Heading>
      <S.CurrencyList>
        <S.DisplayWrapper>
          <S.DisplayTitle>Ethereum Wallet</S.DisplayTitle>
          <S.DisplayContainer>
            <S.Amount>
              {ethBalance !== undefined && formatToDecimalString(ethBalance, 3)}{' '}
              ETH
            </S.Amount>
            <S.Address
              as="a"
              href={`https://etherscan.com/ropsten.etherscan.io/address/${ethAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenWalletAddress(ethAddress)}
            </S.Address>
          </S.DisplayContainer>
        </S.DisplayWrapper>
        <S.DisplayWrapper>
          <S.DisplayTitle>Polkadot Wallet</S.DisplayTitle>
          <S.DisplayContainer>
            <S.Amount>{formatToDecimalString(0.5, 3)} PolkaETH</S.Amount>
            <S.Address onClick={openModal}>
              {polkadotAccs.length > 0 &&
                shortenWalletAddress(polkadotAccs[polkadotAccIndex].address)}
            </S.Address>
          </S.DisplayContainer>
          {isOpen && polkadotAccs.length > 0 && (
            <Modal isOpen={isOpen} closeModal={closeModal} buttonText="Close">
              <S.ModalContainer>
                <S.ModalHeader>
                  <S.ModalTitle>Account</S.ModalTitle>
                  <div>X</div>
                </S.ModalHeader>

                <FormControl className={classes.formControl}>
                  <InputLabel id="polkadot-js-addresses">
                    Select Account:
                  </InputLabel>
                  <Select
                    labelId="polkadot-js-addresses"
                    id="polkadot-js-addressess-select"
                    value={polkadotAccIndex}
                    onChange={handleChange}
                  >
                    {polkadotAccs.map((acc, index) => (
                      <MenuItem value={index}>
                        {shortenWalletAddress(acc.address)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </S.ModalContainer>
            </Modal>
          )}
        </S.DisplayWrapper>
      </S.CurrencyList>
    </S.Wrapper>
  );

  /* return (
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
  ); */
}

export default Nav;
