import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Tab, Tabs,
} from '@material-ui/core';
import {
  fetchOwnedNonFungibleAssets, setShowConfirmTransactionModal, setSwapDirection, updateSelectedAsset,
} from '../../redux/actions/bridge';
import { RootState } from '../../redux/store';
import TabPanel from '../TabPanel';
import NftSelector from './nft/NftSelector';
import { Chain, SwapDirection } from '../../types/types';
import * as ERC721 from '../../contracts/TestToken721.json';
import { createNonFungibleAsset } from '../../types/Asset';

export const NonFungibleTokens = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    bridge: {
      nonFungibleAssets,
      ownedNonFungibleAssets,
    },
    net: {
      ethAddress,
      polkadotAddress,
      web3,
    },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (nonFungibleAssets && ethAddress && polkadotAddress && dispatch) {
      dispatch(fetchOwnedNonFungibleAssets());
    }
  }, [dispatch, ethAddress, polkadotAddress, nonFungibleAssets]);

  const handleTransfer = async ({
    chain, direction, address, id,
  }: { chain: Chain, direction: SwapDirection, address: string, id: string }) => {
    try {
      const contract = new web3!.eth.Contract(ERC721.abi as any, address);
      const selectedAsset = await createNonFungibleAsset(
        {
          contract,
          chain,
          ethId: id,
        },
      );
      dispatch(setSwapDirection(direction));
      dispatch(updateSelectedAsset(selectedAsset));
      dispatch(setShowConfirmTransactionModal(true));
    } catch (e) {
      alert('error finding token. Double check address and ID');
    }
  };

  async function handleTransferToPolkadot(address: string, id: string) {
    // TODO: confirm this token exists
    handleTransfer({
      chain: Chain.ETHEREUM, direction: SwapDirection.EthereumToPolkadot, address, id,
    });
  }

  async function handleTransferToEthereum(address: string, id: string) {
    // TODO: confirm this token exists
    handleTransfer({
      chain: Chain.POLKADOT, direction: SwapDirection.PolkadotToEthereum, address, id,
    });
  }

  return (
    <Paper>
      <Tabs value={selectedTab} onChange={(event, newTab) => setSelectedTab(newTab)}>
        <Tab label="Ethereum" />
        <Tab label="Polkadot" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <NftSelector buttonText="Transfer to Polkadot" onClick={handleTransferToPolkadot} ownedNfts={ownedNonFungibleAssets.ethereum} />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <NftSelector buttonText="Transfer to Ethereum" onClick={handleTransferToEthereum} ownedNfts={ownedNonFungibleAssets.polkadot} />

      </TabPanel>
    </Paper>
  );
};
