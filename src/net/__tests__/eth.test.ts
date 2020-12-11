import Eth from '../eth.ts';
let eth;

beforeAll(async () => {
  // Initialize Eth API
  eth = new Eth(await Eth.connect(), {});
});

afterAll(() => {
  // TODO: Disconnect Eth API?
});

test('Eth Api connection', () => {
  expect(typeof eth.conn).toBe('object');
});

test('Get default Ethereum address', async () => {
  let address = await eth.get_address();

  expect(typeof address).toBe('string');
  expect(address.length).toBe(42);
});

test('Get balance of the default Address', async () => {
  let balance = await eth.get_balance();

  expect(typeof balance).toBe('string');
});
