import localConfig from './config-local';
import stagingConfig from './config-staging';

let config = stagingConfig;

if (process.env.REACT_APP_NODE_CONFIG_ENV === 'local') {
  config = localConfig;
}

export const {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  BASIC_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  BASIC_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  INCENTIVIZED_INBOUND_CHANNEL_CONTRACT_ADDRESS,
  INCENTIVIZED_OUTBOUND_CHANNEL_CONTRACT_ADDRESS,
  REFRESH_INTERVAL_MILLISECONDS,
  HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS,
  HEALTH_CHECK_POLL_MAX_BLOCKS,
  HEALTH_CHECK_POLL_SKIP_BLOCKS,
  POLKADOT_API_PROVIDER,
  POLKADOT_RELAY_API_PROVIDER,
  REQUIRED_ETH_CONFIRMATIONS,
  BLOCK_EXPLORER_URL,
  SNOWBRIDGE_EXPLORER_URL,
  PERMITTED_METAMASK_NETWORK,
  PERMITTED_METAMASK_NETWORK_ID,
  APP_DOT_CONTRACT_ADDRESS,
  SNOW_DOT_ADDRESS,
  BASIC_CHANNEL_ID,
  INCENTIVIZED_CHANNEL_ID,
  ACTIVE_CHANNEL,
  APP_ERC721_CONTRACT_ADDRESS,
} = config;
