import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import CoinGecko from 'coingecko-api';
import { PRICE_CURRENCIES } from '../config';
import { Asset, isDot, isErc20 } from '../types/Asset';

const CoinGeckoClient = new CoinGecko();
// the currencies used to query the coin gecko api
const priceCurrencies = PRICE_CURRENCIES;

export default class Api {
}

// Encode SS58 formated Address to Uint8array
export function ss58ToU8(address: string): Uint8Array {
  // create a keyring with default options
  const keyring = new Keyring();
  const u8: Uint8Array = keyring.decodeAddress(address);
  const hex: string = u8aToHex(u8, -1, false);
  return Buffer.from(hex, 'hex');
}

// fetcasync h asset price from coin geckoPromise<{ [currency: string]: string; }>
export async function getAssetPrice(asset: Asset): Promise<{ [currency: string]: string; }> {
  // store the asset key name to read the result later
  let assetKey = 'ethereum';
  if (isDot(asset)) {
    assetKey = 'polkadot';
  }
  // price request for eth and dot
  let priceRequestPromise = CoinGeckoClient.simple.price({
    ids: assetKey,
    vs_currencies: priceCurrencies,
  });
  // change price request for erc20
  if (isErc20(asset)) {
    assetKey = asset.address;
    priceRequestPromise = CoinGeckoClient.simple.fetchTokenPrice({
      contract_addresses: assetKey,
      vs_currencies: priceCurrencies,
    });
  }
  const result = await priceRequestPromise;
  return result.data[assetKey];
}
