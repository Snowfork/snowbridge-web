import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useDispatch } from 'react-redux';
import { formatBalance } from '@polkadot/util';
import * as S from './Nav.style';
import Modal from '../Modal';
import { setPolkadotAddress } from '../../redux/actions/net';
import { BLOCK_EXPLORER_URL } from '../../config';
import Polkadot from '../../net/polkadot';
import { updateBalances } from '../../redux/actions/bridge';
import FormatAmount from '../FormatAmount';
import { shortenWalletAddress } from '../../utils/common';
import { dotSelector, etherSelector } from '../../redux/reducers/bridge';
import { useAppSelector } from '../../utils/hooks';

const useStyles = makeStyles((theme: Theme) => createStyles({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function Nav(): React.ReactElement {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [polkadotAccounts, setPolkadotAccounts] = useState<string[]>([]);
  const [
    isPolkadotAccountSelectorOpen,
    setIsPolkadotAccountSelectorOpen,
  ] = useState<boolean>(false);

  const { polkadotAddress, ethAddress, polkadotApi } = useAppSelector((state) => state.net);
  const dot = useAppSelector(dotSelector);
  const ether = useAppSelector(etherSelector);

  const polkadotGasBalance = dot?.balance?.polkadot;
  const ethGasBalance = ether?.balance?.eth;

  // fetch polkadot accountsfor the account selector on mount
  useEffect(() => {
    async function fetchAccounts() {
      const accounts = await Polkadot.getAddresses() as any;
      setPolkadotAccounts(
        accounts
          .map(
            (account: any) => account.address,
          ),
      );
    }

    fetchAccounts();
  }, []);

  type AccountSelectorProps = {
    currentAddress: string,
    accounts: string[],
    onAccountChange: (account: string) => void,
    isOpen: boolean,
    onClose: () => void

  }

  const AccountSelector = ({
    accounts, onAccountChange, currentAddress, isOpen, onClose,
  }: AccountSelectorProps): React.ReactElement<AccountSelectorProps> => {
    const [selectedAccount, setSelectedAccount] = useState(currentAddress);
    const handleChange = (event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>) => {
      // get value from select
      const account: string = event.target.value as string;
      // update local state
      setSelectedAccount(account);
      // fire callback from parent to update global state
      onAccountChange(account);
    };

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
      >
        <S.ModalContainer>
          <S.ModalHeader>
            <S.ModalTitle>Account</S.ModalTitle>
          </S.ModalHeader>

          <S.Address>
            {selectedAccount}
          </S.Address>

          <FormControl className={classes.formControl}>
            <InputLabel id="polkadot-js-addresses">
              Select Account:
            </InputLabel>
            <Select
              labelId="polkadot-js-addresses"
              id="polkadot-js-addressess-select"
              value={selectedAccount}
              onChange={handleChange}
            >
              {accounts.map((address) => (
                <MenuItem value={address} key={address}>
                  {shortenWalletAddress(address)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </S.ModalContainer>
      </Modal>
    );
  };

  // handle account changed event from account selector
  // update selected polkadot address in global state
  const onPolkadotAccountSelected = (address: string) => {
    dispatch(setPolkadotAddress(address));
    // fetch balance for updated account
    dispatch(updateBalances());
  };

  // use polkadot utils to format amount
  const polkadotGasBalanceFormatted = formatBalance(polkadotGasBalance, {
    decimals: polkadotApi?.registry.chainDecimals[0],
    withUnit: polkadotApi?.registry.chainTokens[0],
  });

  return (
    <S.Wrapper>
      <S.Heading>Snowbridge</S.Heading>
      <S.CurrencyList>
        <S.DisplayWrapper>
          <S.DisplayTitle>Ethereum Wallet</S.DisplayTitle>
          <S.DisplayContainer>
            <S.Amount>
              <FormatAmount amount={ethGasBalance} decimals={18} />
              {' '}
              ETH
            </S.Amount>
            <S.Address
              as="a"
              href={`${BLOCK_EXPLORER_URL}/address/${ethAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenWalletAddress(ethAddress || '')}
            </S.Address>
          </S.DisplayContainer>

          {/* No account selector for eth since metamask only
            exposes a single address at a time. We instead detect address changes
            and reload the app
          */}

        </S.DisplayWrapper>
        <S.DisplayWrapper>
          <S.DisplayTitle>Polkadot Wallet</S.DisplayTitle>
          <S.DisplayContainer>
            <S.Amount>
              {polkadotGasBalanceFormatted}
            </S.Amount>
            <S.Address onClick={() => setIsPolkadotAccountSelectorOpen(true)}>
              {shortenWalletAddress(polkadotAddress || '')}
            </S.Address>
          </S.DisplayContainer>

          {/* Polkadot account selector */}
          <AccountSelector
            accounts={polkadotAccounts}
            onAccountChange={onPolkadotAccountSelected}
            currentAddress={polkadotAddress!}
            isOpen={isPolkadotAccountSelectorOpen}
            onClose={() => { setIsPolkadotAccountSelectorOpen(false); }}
          />

        </S.DisplayWrapper>
      </S.CurrencyList>
    </S.Wrapper>
  );
}

export default Nav;
