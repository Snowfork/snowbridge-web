import {
  SET_NET,
  SET_METAMASK_FOUND,
  SET_POLKADOTJS_FOUND,
  SET_METAMASK_CONNECTED,
  SET_POLKADOTJS_CONNECTED,
  SET_METAMASK_MISSING,
  SET_POLKADOTJS_MISSING,
  SET_METAMASK_NETWORK,
  SET_ETH_CONTRACT,
  SET_WEB3,
  SET_ERC20_CONTRACT
} from '../actionsTypes';
import { Contract } from 'web3-eth-contract';
import { SetERC20ContractPayload, SetEthContractPayload, SetWeb3Payload } from '../actions';
import Web3 from 'web3';

export interface NetState {
  client: any,
  metamaskFound: boolean,
  polkadotJSFound: boolean,
  metamaskConnected: boolean,
  polkadotJSConnected: boolean,
  metamaskMissing: boolean,
  polkadotJSMissing: boolean,
  metamaskNetwork: string,
  web3?: Web3,
  ethContract?: Contract,
  erc20Contract?: Contract
}

const initialState : NetState = {
  client: null,
  metamaskFound: false,
  polkadotJSFound: false,
  metamaskConnected: false,
  polkadotJSConnected: false,
  metamaskMissing: false,
  polkadotJSMissing: false,
  metamaskNetwork: '',
  web3: undefined,
  ethContract: undefined,
  erc20Contract: undefined
};

function netReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_NET: {
      return Object.assign({}, state, { client: action.payload });
    }
    case SET_METAMASK_FOUND: {
      return Object.assign({}, state, { metamaskFound: true });
    }
    case SET_POLKADOTJS_FOUND: {
      return Object.assign({}, state, { polkadotJSFound: true });
    }
    case SET_METAMASK_CONNECTED: {
      return Object.assign({}, state, { metamaskConnected: true });
    }
    case SET_POLKADOTJS_CONNECTED: {
      return Object.assign({}, state, { polkadotJSConnected: true });
    }
    case SET_METAMASK_MISSING: {
      return Object.assign({}, state, { metamaskMissing: true });
    }
    case SET_POLKADOTJS_MISSING: {
      return Object.assign({}, state, { polkadotJSMissing: true });
    }
    case SET_METAMASK_NETWORK: {
      return Object.assign({}, state, {
        metamaskNetwork: action.metamaskNetwork,
      });
    }
    case SET_WEB3: {
      return ((action: SetWeb3Payload) => {
        return Object.assign({}, state, {
          web3: action.web3
        });
      })(action)
    }
    case SET_ETH_CONTRACT: {
      return ((action: SetEthContractPayload) => {
        return Object.assign({}, state, {
          ethContract: action.contract
        });
      })(action)
    }
    case SET_ERC20_CONTRACT: {
      return ((action: SetERC20ContractPayload) => {
        return Object.assign({}, state, {
          erc20Contract: action.contract
        });
      })(action)
    }

    default:
      return state;
  }
}

export default netReducer;
