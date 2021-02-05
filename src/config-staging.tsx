export default {
  //Contract Addresses
  APP_ETH_CONTRACT_ADDRESS: '0x774667629726ec1fabebcec0d9139bd1c8f72a23',
  APP_ERC20_CONTRACT_ADDRESS: '0x83428c7db9815f482a39a1715684dcf755021997',
  BASIC_INBOUND_CHANNEL: '0x992B9df075935E522EC7950F37eC8557e86f6fdb',
  BASIC_OUTBOUND_CHANNEL: '0x2ffA5ecdBe006d30397c7636d3e015EEE251369F',
  INCENTIVIZED_INBOUND_CHANNEL: '0xFc97A6197dc90bef6bbEFD672742Ed75E9768553',
  INCENTIVIZED_OUTBOUND_CHANNEL: '0xEDa338E4dC46038493b885327842fD3E301CaB39',

  // Fetch chain data interval
  REFRESH_INTERVAL_MILLISECONDS: 10000,

  // Polkadotjs API Provider
  POLKADOT_API_PROVIDER: 'wss://parachain-rpc.snowfork.network',

  // Minimum Number of confirmations required for an ETH transaction
  // to be regarded as a success
  REQUIRED_ETH_CONFIRMATIONS: 12,

  // URL to the block explorer the UI will redirect to
  BLOCK_EXPLORER_URL: 'https://ropsten.etherscan.io',

  PERMITTED_METAMASK_NETWORK: 'ropsten'

};
