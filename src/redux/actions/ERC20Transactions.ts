/* eslint-disable @typescript-eslint/ban-types */
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { utils } from 'ethers';
import {
  SET_TOKEN_ALLOWANCE,
} from '../actionsTypes/ERC20Transactions';
import * as ERC20Api from '../../net/ERC20';
import { RootState } from '../reducers';
import { isErc20 } from '../../types/Asset';

// action creators
export interface SetERC20AllowancePayload { type: string, allowance: number }
export const setERC20Allowance = (allowance: number): SetERC20AllowancePayload => ({
  type: SET_TOKEN_ALLOWANCE,
  allowance,
});

// async middleware actions
export const fetchERC20Allowance = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const userAddress = state.net.ethAddress!;
  const erc20BridgeContractAddress = state.net.erc20Contract!.options.address!;
  const contractInstance = state.bridge.selectedAsset!.contract!;
  if (isErc20(state.bridge.selectedAsset!)) {
    const allowance: number = await ERC20Api.fetchERC20Allowance(
      contractInstance,
      userAddress,
      erc20BridgeContractAddress,
    );
    dispatch(setERC20Allowance(allowance));
  }
};

// grant spender permission to spend owner ERC20 tokens
export const approveERC20 = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const userAddress = state.net.ethAddress!;
  const erc20BridgeContractAddress = state.net.erc20Contract!.options.address!;
  const { selectedAsset, depositAmount } = state.bridge;

  // format deposit amount into unit value
  const decimals = selectedAsset?.decimals;
  const unitValue = utils.parseUnits(depositAmount, decimals).toString();

  try {
    await ERC20Api.approveERC20(
      selectedAsset!.contract!,
      erc20BridgeContractAddress,
      userAddress,
      unitValue,
    );

    dispatch(fetchERC20Allowance());
  } catch (e) {
    console.log('error approving!', e);
    throw new Error('Failed approving ERC20.');
  }
};
