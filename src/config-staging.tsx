import { Channel } from './types/types';

export default {
  // Contract Addresses
  APP_ETH_CONTRACT_ADDRESS: '0x6298dBF612644dB1c46cBBa5C28e20B8612F9d7A',
  APP_ERC20_CONTRACT_ADDRESS: '0xEBaCff0C4B986F93765A52b04F9ECe5D7A8022b0',
  APP_DOT_CONTRACT_ADDRESS: '0x5D7de84231F673447523B99c1ba63a7b9Db8eC22',
  APP_ERC721_CONTRACT_ADDRESS: '0x5F4F4413A903E0D44AFd26fb695A6b765fFBB1Bd',
  SNOW_DOT_ADDRESS: '0xC445A7139FeD69498Cfc0E2EA7Ee1889fEcda460',
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS: '0x366F1aF764d5893B25994819e6061f5fc31046EB',
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS: '0xFaa1274439FB91B72C548dd796B7e5c16cA7bBB2',
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS: '0xABFF2347c0994ecff7fd463E2bF5E62565B7D5bC',
  INCENTIVIZED_OUTBOUND_CHANNEL_CONTRACT_ADDRESS: '0x438Eed45ec3A3799C99399B9D4E13Fa7FD163753',

  // TEST_TOKEN_ADDRESS: '0x7EC73f38cC73398D257f0F42EF0858A4cc986649',
  // TEST_TOKEN_721_ADDRESS: '0xf8DC0d61Ec6d90faCdCf10Ed601a3505554471E7',
  // TEST_TOKEN_721_ENUMERABLE_ADDRESS: '0x30b3399E441379bd54812aDd32659544AE7254C2',

  // Fetch chain data interval
  REFRESH_INTERVAL_MILLISECONDS: 10000,

  // Health check data refresh interval
  HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS: 120_000,
  // Health check will check at most n blocks from ethereum for time information
  HEALTH_CHECK_ETHEREUM_POLL_MAX_BLOCKS: 1000,
  // Health check will check at most n blocks from polkadot for time information
  HEALTH_CHECK_POLKADOT_POLL_MAX_BLOCKS: 10000,
  // Allow health check to skip blocks for performance
  HEALTH_CHECK_POLKADOT_POLL_SKIP_BLOCKS: 1000,

  //Provider for listening ethereum events
  ETHEREUM_WEB_SOCKET__PROVIDER: `wss://ropsten.infura.io/ws/v3/${process.env.REACT_APP_INFURA_KEY}`,

  // Polkadotjs API Provider
  POLKADOT_API_PROVIDER: 'wss://parachain-rpc.snowbridge.network',
  POLKADOT_RELAY_API_PROVIDER: 'wss://polkadot-rpc.snowbridge.network',

  // Minimum Number of confirmations required for an ETH transaction
  // to be regarded as a success
  REQUIRED_ETH_CONFIRMATIONS: 8,

  // URL to the block explorer the UI will redirect to
  BLOCK_EXPLORER_URL: 'https://ropsten.etherscan.io',
  SNOWBRIDGE_EXPLORER_URL: 'https://polkadot.js.org/apps/?rpc=wss://parachain-rpc.snowbridge.network#/explorer',

  PERMITTED_ETH_NETWORK: 'ropsten',
  PERMITTED_ETH_NETWORK_ID: '0x3',

  BASIC_CHANNEL_ID: 0,
  INCENTIVIZED_CHANNEL_ID: 1,
  ACTIVE_CHANNEL: Channel.INCENTIVIZED,

  //Asset id for wrapped Ether
  PARACHAIN_ETHER_ASSET_ID: 0,
  //Key required for connection with walletconnect
  INFURA_KEY: process.env.REACT_APP_INFURA_KEY,
  PARACHAIN_LIST : [
    { "parachainName":'Snowbridge', "parachainId": 0, 'isDisabled':false },
    { "parachainName":'Snowbridge-test', "parachainId": 1001,'isDisabled':false },
    { "parachainName":'Acala (coming soon...)', "parachainId": 0,'isDisabled':true },
    { "parachainName":'Moonbeam (coming soon...)', "parachainId": 0,'isDisabled':true },
    { "parachainName":'Bifrost (coming soon...)', "parachainId": 0,'isDisabled':true },
    { "parachainName":'Kusama (coming soon...)', "parachainId": 0, 'isDisabled':true },
    { "parachainName":'Snowbridge (coming soon...)', "parachainId": 0,'isDisabled':true }
  ]
};
