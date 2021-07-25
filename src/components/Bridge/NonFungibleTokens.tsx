import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, InputLabel } from '@material-ui/core';
import { fetchOwnedNonFungibleAssets, setShowConfirmTransactionModal, updateSelectedAsset } from '../../redux/actions/bridge';
import { RootState } from '../../redux/store';
import { createNonFungibleAsset, NonFungibleToken } from '../../types/Asset';
import { Chain } from '../../types/types';

import ERC721Abi from '../../contracts/ERC721.json';

export const NonFungibleTokens = () => {
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('0xA79fC743bcCDF8ec0078021fF7b00837a7CDB032');
  const [selectedTokenId, setSelectedTokenId] = useState('3');
  const {
    bridge: {
      ownedNonFungibleAssets,
    },
    net: {
      ethAddress,
      web3,
    },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOwnedNonFungibleAssets());
  }, [dispatch, ethAddress]);

  function handleTransfer() {
    const contract = new web3!.eth.Contract(ERC721Abi.abi as any, selectedTokenAddress);
    // TODO: fetch name and symbol from contract
    const selectedAsset = createNonFungibleAsset(
      contract,
      Chain.ETHEREUM,
      selectedTokenId,
      'test',
      'test',
    );
    dispatch(updateSelectedAsset(selectedAsset));
    dispatch(setShowConfirmTransactionModal(true));
  }

  return (
    <div>
      {/* TODO: put in tabs? This is only eth -> polkadot for now */}
      <div>
        {
          Object.keys(ownedNonFungibleAssets).map((contract) => (
            <div key={contract}>
              <h3>{Object.values(ownedNonFungibleAssets[contract])[0]?.name}</h3>
              <h5>{contract}</h5>
              <ul>
                {
                  Object.values(ownedNonFungibleAssets[contract]).map((ownedNft) => (
                    <li key={ownedNft.id}>
                      {ownedNft.tokenURI && <img src={ownedNft.tokenURI} alt="token preview" />}
                      <p>
                        id:
                        {ownedNft.id}
                      </p>
                    </li>
                  ))
                }
              </ul>
            </div>
          ))
        }
      </div>

      <div>
        <p>Dont see your nft?</p>
        <InputLabel htmlFor="contract">Contract</InputLabel>
        <Input type="text" name="contract" value={selectedTokenAddress} onChange={(e) => setSelectedTokenAddress(e.target.value)} />
        <InputLabel htmlFor="token">Token</InputLabel>
        <Input type="text" name="token" value={selectedTokenId} onChange={(e) => setSelectedTokenId(e.target.value)} />

      </div>

      <div>
        <Button onClick={handleTransfer}>Transfer</Button>
      </div>
    </div>
  );
};
