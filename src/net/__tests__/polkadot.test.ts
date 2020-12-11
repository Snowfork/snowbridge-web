import Polkadot from '../polkadot.ts';
let polkadot;

beforeAll(async () => {
  // Initialize polkadot API
  polkadot = new Polkadot(await Polkadot.connect(), {});
});

afterAll(() => {
  // TODO: Disconnect Polkadot API?
});

test('Polkadot Api connection', () => {
  expect(typeof polkadot.conn).toBe('object');
});

test('Get default Polkadot address', async () => {
  let address = await polkadot.get_address();

  expect(typeof address).toBe('string');
});

test('Get balance of the default Polkadot Address', async () => {
  let balance = await polkadot.get_balance();

  expect(typeof balance).toBe('object');
});
