import React from 'react';

import ExpandButton from '../../Button/ExpandButton';

import { useAppSelector } from '../../../utils/hooks';
import { NonFungibleToken } from '../../../types/Asset';
import { Chain } from '../../../types/types';

type Props = {
  openAssetSelector: () => void,
}

export const SelectedNFT = ({ openAssetSelector }: Props) => {
  const {
    selectedAsset,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const token = (selectedAsset?.token as NonFungibleToken);
  const tokenSourceChain = selectedAsset?.chain === Chain.ETHEREUM ? 0 : 1;
  const tokenValid = tokenSourceChain === swapDirection;

  const selectedAssetText = tokenValid
    ? `${selectedAsset?.name}:${token.subId || token?.ethId}`
    : 'Select an asset';

  return (
    <ExpandButton onClick={() => openAssetSelector()}>
      {selectedAssetText}
    </ExpandButton>
  );
};
