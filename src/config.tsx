import localConfig from './config-local';
import stagingConfig from './config-staging';

let config = stagingConfig;

if (process.env.REACT_APP_NODE_CONFIG_ENV === 'local') {
  config = localConfig;
}

export const {
  APP_ETH_CONTRACT_ADDRESS,
  APP_ERC20_CONTRACT_ADDRESS,
  BASIC_INBOUND_CHANNEL,
  BASIC_OUTBOUND_CHANNEL,
  INCENTIVIZED_INBOUND_CHANNEL,
  INCENTIVIZED_OUTBOUND_CHANNEL,
  REFRESH_INTERVAL_MILLISECONDS,
  POLKADOT_API_PROVIDER,
  REQUIRED_ETH_CONFIRMATIONS,
  BLOCK_EXPLORER_URL,
  PERMITTED_METAMASK_NETWORK
} = config;
