import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { NonFungibleToken } from '../../types/Asset';
import { RootState } from '../store';
import { fetchERC20Allowance } from './ERC20Transactions';
import * as ERC721Api from '../../net/ERC721';
import { APP_ERC721_CONTRACT_ADDRESS } from '../../config';

// grant spender permission to spend owner ERC20 tokens
export const approveERC721 = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const userAddress = state.net.ethAddress!;
  const erc721BridgeContractAddress = APP_ERC721_CONTRACT_ADDRESS;
  const { selectedAsset } = state.bridge;
  const token = selectedAsset?.token as NonFungibleToken;

  try {
    await ERC721Api.approveERC721(
      selectedAsset!.contract!,
      token.id.toString(),
      erc721BridgeContractAddress,
      userAddress,
    );

    dispatch(fetchERC20Allowance());
  } catch (e) {
    console.log('error approving!', e);
    throw new Error('Failed approving ERC721.');
  }
};
