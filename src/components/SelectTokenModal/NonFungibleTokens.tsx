import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
} from '@material-ui/core';
import {
  fetchOwnedNonFungibleAssets, setShowConfirmTransactionModal, updateSelectedAsset,
} from '../../redux/actions/bridge';
import { RootState } from '../../redux/store';
import NftSelector from './nft/NftSelector';
import { Chain, SwapDirection } from '../../types/types';
import * as ERC721 from '../../contracts/TestToken721.json';
import { createNonFungibleAsset } from '../../types/Asset';
import { Asset } from '../../types/Asset';

type Props = {
  handleTokenSelection: (asset: Asset) => void;
};

export const NonFungibleTokens = ({ handleTokenSelection }: Props) => {

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
    bridge: {
      swapDirection,
    }
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (nonFungibleAssets && ethAddress && polkadotAddress && dispatch) {
      dispatch(fetchOwnedNonFungibleAssets());
    }
  }, [dispatch, ethAddress, polkadotAddress, nonFungibleAssets]);

  const handleNFTSelected = async ({
    chain, address, id,
  }: { chain: Chain, address: string, id: string }) => {
    try {
      const contract = new web3!.eth.Contract(ERC721.abi as any, address);
      const selectedAsset = await createNonFungibleAsset(
        {
          contract,
          chain,
          ethId: id,
        },
      );
      handleTokenSelection(selectedAsset)
    } catch (e) {
      alert('error finding token. Double check address and ID');
    }
  };

  async function handleEthereumNFTSelected(address: string, id: string) {
    // TODO: confirm this token exists
    handleNFTSelected({
      chain: Chain.ETHEREUM, address, id,
    });
  }

  async function handlePolkadotNFTSelected(address: string, id: string) {
    // TODO: confirm this token exists
    handleNFTSelected({
      chain: Chain.POLKADOT, address, id,
    });
  }

  const onNFTSelected = swapDirection === SwapDirection.EthereumToPolkadot ? handleEthereumNFTSelected : handlePolkadotNFTSelected;
  const ownedNfts = swapDirection === SwapDirection.EthereumToPolkadot ? ownedNonFungibleAssets.ethereum : ownedNonFungibleAssets.polkadot;
  return (
    <Paper>
      <NftSelector onNFTSelected={onNFTSelected} ownedNfts={ownedNfts} />
    </Paper >
  );
};
