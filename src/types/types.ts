// ERC20 interface for tokens in the token list
export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number
  logoURI: string;
}

export enum Chain {
  ETHEREUM = 'eth',
  POLKADOT = 'polkadot'
}

export enum SwapDirection {
  EthereumToPolkadot,
  PolkadotToEthereum
}
