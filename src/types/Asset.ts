import { Contract } from 'web3-eth-contract';
import { Chain, SwapDirection, Token } from './types';

export interface Asset {
    // the chain for the native asset
    chain: Chain;
    // full native asset name
    name: string;
    // wrapped asset name - for opposite chain
    wrappedName: string;
    // native token symbol
    symbol: string;
    // wrapped token symbol - for opposite chain
    wrappedSymbol: string;
    // native decimals
    decimals: number;
    // decimals for the wrapped version of this token
    wrappedDecimals: number;
    // address for contract on ethereum
    address: string;
    // deployed ethereum chain ID
    chainId: number;
    // token logo
    logoUri: string;
    // web3 contract instance
    // this will be undefined for Ether
    contract?: Contract;
    // asset balances for each chain
    balance: {
        // eth: string,
        // polkadot: string
        [chain in Chain]: string
    }
    // prices for this asset
    prices: {
        [currency: string]: string
    }
}

export function isErc20(asset: Asset): boolean {
  return asset.address.length === 42
    && asset.chain === Chain.ETHEREUM;
}

export function isEther(asset: Asset): boolean {
  return !isErc20(asset)
    && asset.chain === Chain.ETHEREUM
    && asset.address === '0x0';
}

export function isDot(asset: Asset): boolean {
  return asset.chain === Chain.POLKADOT
    && !isErc20(asset)
    && !isEther(asset);
}

function ethSymbols(
  asset: Asset,
  swapDirection: SwapDirection,
):{to: string, from: string} {
  if (swapDirection === SwapDirection.EthereumToPolkadot) {
    return {
      to: asset.wrappedSymbol,
      from: asset.symbol,
    };
  }
  return {
    from: asset.wrappedSymbol,
    to: asset.symbol,
  };
}

function polkadotSymbols(
  asset: Asset,
  swapDirection: SwapDirection,
):{to: string, from: string} {
  if (swapDirection === SwapDirection.PolkadotToEthereum) {
    return {
      to: asset.wrappedSymbol,
      from: asset.symbol,
    };
  }
  return {
    from: asset.wrappedSymbol,
    to: asset.symbol,
  };
}

export function symbols(asset: Asset, swapDirection: SwapDirection):
 {to: string, from: string} {
  let result = polkadotSymbols(asset, swapDirection);

  if (!isDot(asset)) {
    result = ethSymbols(asset, swapDirection);
  }

  return result;
}

// Asset factory function
export function createAsset(
  token: Token,
  chain: Chain,
  wrappedDecimals: number,
  contract?: Contract,
): Asset {
  return {
    name: token.name,
    symbol: token.symbol,
    wrappedSymbol: `snow${token.symbol}`,
    wrappedName: `snow${token.name}`,
    contract,
    address: token.address,
    chain,
    balance: {
      eth: '0',
      polkadot: '0',
    },
    chainId: token.chainId,
    decimals: token.decimals,
    logoUri: token.logoURI,
    prices: {

    },
    wrappedDecimals,
  };
}
