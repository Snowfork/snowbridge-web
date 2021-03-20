import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useDispatch, useSelector } from 'react-redux';
import * as S from './Nav.style';
import { shortenWalletAddress } from '../../utils/common';
import Modal from '../Modal';
import TransactionsList from '../TransactionsList/';
import { TransactionsState } from '../../redux/reducers/transactions';
import { RootState } from '../../redux/reducers';
import { setPolkadotAddress } from '../../redux/actions/net';
import { BLOCK_EXPLORER_URL } from '../../config';
import Polkadot from '../../net/polkadot';

type Props = {
  transactions: TransactionsState;
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

function Nav({ transactions }: Props): React.ReactElement<Props> {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [polkadotAccounts, setPolkadotAccounts] = useState<string[]>([]);
  const [isPolkadotAccountSelectorOpen, setIsPolkadotAccountSelectorOpen] = useState<boolean>(false)

  const { ethBalance, polkadotGasBalance } = useSelector((state: RootState) => state.transactions)
  const { polkadotAddress, ethAddress } = useSelector((state: RootState) => state.net)

  
  // fetch polkadot accounts on mount
  useEffect(() => {
    async function fetchAccounts() {
      const accounts = await Polkadot.get_addresses() as any;
      setPolkadotAccounts(
        accounts
          .map(
            (account: any) => account.address
          ))
    }

    fetchAccounts()
  }, []);

  type AccountSelectorProps = {
    currentAddress: string,
    accounts: string[],
    onAccountChange: (account: string) => void,
    isOpen: boolean,
    onClose: () => void
      
  }

  const AccountSelector = ({ accounts, onAccountChange, currentAddress, isOpen, onClose }: AccountSelectorProps): React.ReactElement<AccountSelectorProps> => {
    const [selectedAccount, setSelectedAccount] = useState(currentAddress)    
    const handleChange = (event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>) => {
      // get value from select
      const account: string = event.target.value as string;
      // update local state
      setSelectedAccount(account)
      // fire callback from parent to update global state
      onAccountChange(account)
    }

    return (
      <Modal
        isOpen={isOpen}
        closeModal={onClose}
        buttonText="Close"
      >
      <S.ModalContainer>
        <S.ModalHeader>
          <S.ModalTitle>Account</S.ModalTitle>
          </S.ModalHeader>
          
          <S.Address >
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
            {accounts.map((address, index) => (
                <MenuItem value={address} key={index}>
                  {shortenWalletAddress(address)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </S.ModalContainer>
    </Modal>
  )
}

  // handle account changed event from account selector
  // update selected polkadot address in global state
  const onPolkadotAccountSelected = (address: string) => {
    dispatch(setPolkadotAddress(address))
  }

  return (
    <S.Wrapper>
      <S.Heading>Snowbridge</S.Heading>
      <S.CurrencyList>
        <S.DisplayWrapper>
          <S.DisplayTitle>Ethereum Wallet</S.DisplayTitle>
          <S.DisplayContainer>
            <S.Amount>{ethBalance} ETH</S.Amount>
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
            <S.Amount>{polkadotGasBalance?.toString()}</S.Amount>
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
            onClose={()=>{setIsPolkadotAccountSelectorOpen(false)}}
          />
          
        </S.DisplayWrapper>
        <TransactionsList transactions={transactions} />
      </S.CurrencyList>
    </S.Wrapper>
  );
}

export default Nav;
