/* eslint-disable @typescript-eslint/ban-types */
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { utils } from 'ethers';
import { RootState } from '../store';
import { isErc20 } from '../../types/Asset';
import { erc20TransactionsSlice } from '../reducers/ERC20Transactions';

// action creators
export const {
  setERC20Allowance,
} = erc20TransactionsSlice.actions;

// async middleware actions
export const fetchERC20Allowance = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    net: {
      sdk,
      ethAddress,
    },
    bridge: {
      selectedAsset,
    },
  } = state;
  if (isErc20(state.bridge.selectedAsset!)) {
    const allowance = await sdk!.ethClient!.getERC20Allowance(ethAddress!, selectedAsset!.address);
    dispatch(erc20TransactionsSlice.actions.setERC20Allowance(allowance));
  }
};

// grant spender permission to spend owner ERC20 tokens
export const approveERC20 = ():
  ThunkAction<Promise<void>, {}, {}, AnyAction> => async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>, getState,
): Promise<void> => {
  const state = getState() as RootState;
  const {
    net: {
      sdk,
      ethAddress,
    },
    bridge: {
      selectedAsset,
      depositAmount,
    },
  } = state;
  // format deposit amount into unit value
  const decimals = selectedAsset?.decimals;
  const unitValue = utils.parseUnits(depositAmount, decimals).toString();

  try {
    if (sdk) {
      await sdk
        .ethClient!.approveERC20(
          selectedAsset!.address,
          ethAddress!,
          unitValue,
        );
    }

    dispatch(fetchERC20Allowance());
  } catch (e) {
    console.log('error approving!', e);
    throw new Error('Failed approving ERC20.');
  }
};
