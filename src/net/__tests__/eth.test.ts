import Eth from '../eth.ts';

describe('Ethereum API', () => {
  let eth: Eth;

  beforeAll(async () => {
    const dispatch = jest.fn();
    // Initialize Eth API
    eth = new Eth(await Eth.connect(dispatch), {}, true);
  });

  test('Test eth connection', () => {
    expect(typeof eth.conn).toBe('object');
  });

  test('Get default Ethereum address', async () => {
    let address = await eth.get_address();

    expect(typeof address).toBe('string');
    expect(eth.conn.utils.isAddress(address)).toBe(true);
  });

  test('Get balance of the default Address', async () => {
    let balance = await eth.get_balance();

    expect(typeof balance).toBe('string');
  });
});
