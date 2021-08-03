import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Tab, Tabs,
} from '@material-ui/core';
import {
  fetchOwnedNonFungibleAssets,
} from '../../redux/actions/bridge';
import { RootState } from '../../redux/store';
import NftPolkadot from './nft/NftPolkadot';
import TabPanel from '../TabPanel';
import NftEthereum from './nft/NftEthereum';

export const NonFungibleTokens = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    bridge: {
      nonFungibleAssets,
    },
    net: {
      ethAddress,
      polkadotAddress,
    },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (nonFungibleAssets && ethAddress && polkadotAddress && dispatch) {
      dispatch(fetchOwnedNonFungibleAssets());
    }
  }, [dispatch, ethAddress, polkadotAddress, nonFungibleAssets]);

  return (
    <Paper>
      <Tabs value={selectedTab} onChange={(event, newTab) => setSelectedTab(newTab)}>
        <Tab label="Ethereum" />
        <Tab label="Polkadot" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <NftEthereum />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <NftPolkadot />
      </TabPanel>
    </Paper>
  );
};
