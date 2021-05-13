import { Contract } from 'web3-eth-contract';

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
  id: string,
  name: string,
  tokenURI: string
}

export enum Chain {
  ETHEREUM = 'eth',
  POLKADOT = 'polkadot'
}

export enum SwapDirection {
  EthereumToPolkadot,
  PolkadotToEthereum
}
