import Polkadot from '../polkadot.ts';
import { checkAddress } from '@polkadot/util-crypto';

describe('Polkadot API connection', () => {
  let polkadot: Polkadot;

  beforeAll(async () => {
    const dispatch = jest.fn();

    // Initialize polkadot API
    polkadot = new Polkadot(await Polkadot.connect(dispatch), {}, true);
  });

  test('Polkadot Api connection', () => {
    expect(typeof polkadot.conn).toBe('object');
  });

  test('Get default Polkadot address', async () => {
    let addresses = await polkadot.get_addresses();

    expect(typeof addresses[0]).toBe('string');
    expect(checkAddress(addresses[0], 42)).toEqual([true, null]);
  });

  test('Get balance of the default Polkadot Address', async () => {
    let addresses = await polkadot.get_addresses();
    let balance = await polkadot.get_balance(addresses[0]);

    expect(typeof balance).toBe('string');
  });
});
