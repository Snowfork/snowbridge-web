export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export enum SwapDirection {
  EthereumToPolkadot,
  PolkadotToEthereum
}