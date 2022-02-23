import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { NonFungibleToken, AssetType } from '../../types/Asset';
import { RootState } from '../store';
import * as ERC721Api from '../../net/ERC721';
import { CONTRACT_ADDRESS } from '../../config';
import { erc721TransactionsSlice } from '../reducers/ERC721Transactions';

export const approveERC721 = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
  ): Promise<void> => {
    const state = getState() as RootState;
    const userAddress = state.net.ethAddress!;
    const erc721BridgeContractAddress = CONTRACT_ADDRESS.ERC721App;
    const { selectedAsset } = state.bridge;
    const token = selectedAsset?.token as NonFungibleToken;

    try {
      await ERC721Api.approveERC721(
        selectedAsset!.contract!,
        token.ethId.toString(),
        erc721BridgeContractAddress,
        userAddress,
      );

      dispatch(fetchERC721Approved());
    } catch (e) {
      console.log('error approving!', e);
      throw new Error('Failed approving ERC721.');
    }
  };

export const fetchERC721Approved = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
  ): Promise<void> => {
    const state = getState() as RootState;
    const erc721BridgeContractAddress = state.net.erc721AppContract?.options.address;
    const contractInstance = state.bridge.selectedAsset?.contract;

    if (state.bridge.selectedAsset?.type !== AssetType.ERC721) {
      return;
    }

    if (!erc721BridgeContractAddress || !contractInstance) {
      return;
    }

    const approved = await ERC721Api.getApproved(
      contractInstance,
      (state.bridge.selectedAsset?.token as NonFungibleToken).ethId,
    );

    dispatch(erc721TransactionsSlice.actions.setERC721Approved(approved === erc721BridgeContractAddress));
  };
