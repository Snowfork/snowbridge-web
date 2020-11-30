import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

export default class Api {
  public conn?: Web3 | ApiPromise;
}

// Encode SS58 formated Address to Uint8array
export function ss58_to_u8(address: string): Uint8Array {
  // create a keyring with default options
  const keyring = new Keyring();
  const u8: Uint8Array = keyring.decodeAddress(address);
  const hex: string = u8aToHex(u8, -1, false);
  return Buffer.from(hex, 'hex');
}
