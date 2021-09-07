export default {
  // Contract Addresses
  APP_ETH_CONTRACT_ADDRESS: '0xf394C92Eaf89124c16AB65a1188964FAEa6b3f93',
  APP_ERC20_CONTRACT_ADDRESS: '0x16e727C644120f40B5C060f6ED4a8c1110F9Ca48',
  APP_DOT_CONTRACT_ADDRESS: '0x99614A31Ca9Cf6C9d215a39B3e356afCc8589e67',
  APP_ERC721_CONTRACT_ADDRESS: '0xFeBf544BEBE6dE452c23EaEB420718041B686D15',
  SNOW_DOT_ADDRESS: '0x7A2e9f441F3Ecea52Ace45E6642aBa2A3a87aF19',
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS: '0xC0F492C0752978Aa4C3D0586946DEe2f1111F5f0',
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS: '0x9A780F8a92EE1154C616D562932311bf76ee5c76',
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS: '0xaed55c233B3EbBE94B55155fa77e3283103b63e3',
  INCENTIVIZED_OUTBOUND_CHANNEL_CONTRACT_ADDRESS: '0x2F54cBa69Aa160A62c4c5AE0c0358632065386A1',

  // TEST_TOKEN_ADDRESS: '0xBb0Ed63218FE9043658C8178E9566Fc10213E528',
  // TEST_TOKEN_721_ADDRESS: '0x668e44F44C8c522007CE23af4b62C65EAbBC6ce9',
  // TEST_TOKEN_721_ENUMERABLE_ADDRESS: '0x7119EFA5aaBC79cD840A0E3d4F745b4c746534eD',

  // Fetch chain data interval
  REFRESH_INTERVAL_MILLISECONDS: 10000,

  // Polkadotjs API Provider
  POLKADOT_API_PROVIDER: 'wss://parachain-rpc.snowbridge.network',

  // Minimum Number of confirmations required for an ETH transaction
  // to be regarded as a success
  REQUIRED_ETH_CONFIRMATIONS: 3,

  // URL to the block explorer the UI will redirect to
  BLOCK_EXPLORER_URL: 'https://ropsten.etherscan.io',

  PERMITTED_METAMASK_NETWORK: 'ropsten',

  PRICE_CURRENCIES: ['usd'],

  BASIC_CHANNEL_ID: 0,
  INCENTIVIZED_CHANNEL_ID: 1,
};
