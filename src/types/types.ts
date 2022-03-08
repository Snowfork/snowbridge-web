import { Contract } from 'web3-eth-contract';
import icons from '../components/Icon';

// ERC20 interface for tokens in the token list
export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number
  logoURI: string;
}

// ERC721 token interface for contract list
export interface NonFungibleTokenContract {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  contract: Contract;
}

// ERC721 token instance interface
export interface OwnedNft {
  address: string,
  ethId?: string,
  name: string,
  tokenURI?: string
  polkadotId?: string;
  chain: Chain;
}

export enum Chain {
  ETHEREUM = 'eth',
  POLKADOT = 'polkadot'
}

export enum SwapDirection {
  EthereumToPolkadot,
  PolkadotToEthereum
}

export enum Channel {
  BASIC = 'basic',
  INCENTIVIZED = 'incentivized'
}

export type IconKeys = keyof typeof icons;

export interface AssetBalance {
  isAssetFound: boolean,
  amount: string
};

export interface PolkadotTxConfirmation {
  istxFound: boolean,
  nonce: string
};