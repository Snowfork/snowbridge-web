import { Button } from '@material-ui/core';
import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { updateSelectedAsset, setShowConfirmTransactionModal, setSwapDirection } from '../../../redux/actions/bridge';
import { RootState } from '../../../redux/store';
import { createNonFungibleAsset } from '../../../types/Asset';
import { Chain, SwapDirection } from '../../../types/types';
import ERC721Abi from '../../../contracts/TestToken721.json';
import ManualInput from './ManualInput';
import Polkadot from '../../../net/polkadot';

const NftPolkadot = () => {
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('0x4283d8996E5a7F4BEa58c6052b1471a2a9524C87');
  const [selectedTokenId, setSelectedTokenId] = useState('3');
  const {
    bridge: {
      ownedNonFungibleAssets,
    },
    net: {
      web3,
      polkadotApi,
    },
  } = useSelector((state: RootState) => state);
  const ownedNfts = ownedNonFungibleAssets.polkadot;
  const dispatch = useDispatch();

  async function handleTransfer() {
    const contract = new web3!.eth.Contract(ERC721Abi.abi as any, selectedTokenAddress);
    const subId = (await Polkadot.getSubTokenIdFromEthTokenId(polkadotApi!, selectedTokenAddress, selectedTokenId)).toString();
    // TODO: handle subID not found
    const selectedAsset = await createNonFungibleAsset(
      {
        chain: Chain.POLKADOT,
        contract,
        ethId: selectedTokenId,
        subId,
      },
    );
    dispatch(setSwapDirection(SwapDirection.PolkadotToEthereum));
    dispatch(updateSelectedAsset(selectedAsset));
    dispatch(setShowConfirmTransactionModal(true));
  }

  return (
    <div>
      {
        Object.keys(ownedNfts).map((contract) => (
          <div key={contract}>
            <h3>{Object.values(ownedNfts[contract])[0]?.name}</h3>
            <h5>{contract}</h5>
            <ul>
              {
                Object.values(ownedNfts[contract]).map((ownedNft, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={ownedNft.ethId + ownedNft.address + i}>
                    {ownedNft.tokenURI && <img src={ownedNft.tokenURI} alt="token preview" />}
                    <p>
                      id:
                      {ownedNft.ethId}
                    </p>
                  </li>
                ))
              }
            </ul>
          </div>
        ))
      }

      <ManualInput
        contract={selectedTokenAddress}
        onContractChanged={setSelectedTokenAddress}
        id={selectedTokenId}
        onIdChanged={setSelectedTokenId}
      />

      <div>
        <Button onClick={handleTransfer}>Transfer to Ethereum</Button>
      </div>

    </div>
  );
};
export default NftPolkadot;
