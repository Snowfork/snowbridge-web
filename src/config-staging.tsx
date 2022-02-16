import { Channel } from './types/types';

export default {
  // Contract Addresses
  CONTRACT_ADDRESS:{
    BasicInboundChannel:'',
    IncentivizedInboundChannel:'',
    BasicOutboundChannel:'',
    IncentivizedOutboundChannel:'',
    ETHApp:'',
    DOTApp:'',
    ERC20App:'',
    ERC721App:'',
    SnowDOTAddress:'',
  },

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

  //Key required for connection with walletconnect
  INFURA_KEY:process.env.REACT_APP_INFURA_KEY,
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
