import { CreateContractInstancePayload, SetContractAddressPayload, SetERC20AllowancePayload, SetERC20BalancePayload, SetTokenNamePayload } from "../actions/ERC20Transactions";
import { CREATE_CONTRACT_INSTANCE, SET_CONTRACT_ADDRESS, SET_TOKEN_ALLOWANCE, SET_TOKEN_BALANCE, SET_TOKEN_NAME } from "../actionsTypes/ERC20Transactions";
import * as ERC20 from '../../contracts/ERC20.json';

export interface ERC20TransactionsState {
  contractAddress?: string;
  contractInstance?: any;
  allowance: Number;
  balance: Number;
  name: string;
}

const initialState: ERC20TransactionsState = {
  contractAddress: "", //set to dai for defualt during dev/testing
  contractInstance: null,
  allowance: 0,
  balance: 0,
  name: ''
}

function transactionsReducer(state: ERC20TransactionsState = initialState, action: any): ERC20TransactionsState {
  switch (action.type) {
    case SET_CONTRACT_ADDRESS: {
      return ((action: SetContractAddressPayload) => {
        return Object.assign({}, state, {
          contractAddress: action.contractAddress
        });
      })(action)
    }
    case CREATE_CONTRACT_INSTANCE: {
      return ((action: CreateContractInstancePayload) => {
        let tokenContractInstance: any = state.contractAddress;

        // create contract instance
        // All valid contract addresses have 42 characters ('0x' + address)
        if (action.contractAddress?.length === 42) {
          tokenContractInstance = new action.web3.eth.Contract(
            ERC20.abi as any,
            action.contractAddress,
          );
        }
        //   store in state
        return Object.assign({}, state, {
          contractInstance: tokenContractInstance
        });
      })(action)
    }

    case SET_TOKEN_ALLOWANCE: {
      return ((action: SetERC20AllowancePayload) => {
        return Object.assign({}, state, {
          allowance: action.allowance
        });
      })(action)
    }

    case SET_TOKEN_BALANCE: {
      return ((action: SetERC20BalancePayload) => {
        return Object.assign({}, state, {
          balance: action.balance
        });
      })(action)
    }

    case SET_TOKEN_NAME: {
      return ((action: SetTokenNamePayload) => {
        return Object.assign({}, state, {
          name: action.name
        });
      })(action)
    }

    default:
      return state
  }
}


export default transactionsReducer;
