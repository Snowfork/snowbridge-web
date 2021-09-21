import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../../../utils/hooks';
import { useDispatch } from 'react-redux';

import Select from '../../../Select/Select';
import Option from '../../../Select/Option';
import StatusBubble from './StatusBubble';

import { shortenWalletAddress } from '../../../../utils/common';

import Polkadot from '../../../../net/polkadot';
import { setPolkadotAddress } from '../../../../redux/actions/net';
import { updateBalances } from '../../../../redux/actions/bridge';

type Props = {
  className?: string;
}

const PolkadotAddressDisplay = ({ className }: Props) => {
  const dispatch = useDispatch();

  const { polkadotAddress } = useAppSelector((state) => state.net);
  const [polkadotAccounts, setPolkadotAccounts] = useState<string[]>([]);

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

  const onPolkadotAccountSelected = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setPolkadotAddress(event.target.value));
    dispatch(updateBalances());
  };

  return (
    <div className={className}>
      <StatusBubble className='address-status' status={polkadotAddress ? 1 : 0} />
      <Select value={polkadotAddress!} onChange={onPolkadotAccountSelected}>
        {polkadotAccounts.map((address) => (
          <Option value={address} key={address}>
            {shortenWalletAddress(address)}
          </Option>
        ))}
      </Select>
    </div>
  );
}

export default styled(PolkadotAddressDisplay)`
  max-width: 200px;
  position: relative;

  .address-status {
    position: absolute;
    top: calc(50% - 5px);
    left: 10px;
    cursor: pointer;
    pointer-events: none
  }

`;
