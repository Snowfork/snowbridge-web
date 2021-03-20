import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

export default class Api {
}

// Encode SS58 formated Address to Uint8array
export function ss58_to_u8(address: string): Uint8Array {
  // create a keyring with default options
  const keyring = new Keyring();
  const u8: Uint8Array = keyring.decodeAddress(address);
  const hex: string = u8aToHex(u8, -1, false);
  return Buffer.from(hex, 'hex');
}
