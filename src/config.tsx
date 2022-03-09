import localConfig from './config-local';
import stagingConfig from './config-staging';
import contractAddresses from './contractAddresses.json'

let config = stagingConfig;

if (process.env.REACT_APP_NODE_CONFIG_ENV === 'local') {
  if(contractAddresses.name === 'localhost') {
    config = localConfig;
  }
}

config.CONTRACT_ADDRESS = contractAddresses;

//Fetching and updating contract address from contractAddresses.json file as per env


export const {
  CONTRACT_ADDRESS,
  REFRESH_INTERVAL_MILLISECONDS,
  HEALTH_CHECK_POLL_INTERVAL_MILLISECONDS,
  HEALTH_CHECK_POLKADOT_POLL_MAX_BLOCKS,
  HEALTH_CHECK_ETHEREUM_POLL_MAX_BLOCKS,
  HEALTH_CHECK_POLKADOT_POLL_SKIP_BLOCKS,
  SET_INTERVAL_TIME,
  ETHEREUM_WEB_SOCKET_PROVIDER,
  POLKADOT_API_PROVIDER,
  POLKADOT_RELAY_API_PROVIDER,
  REQUIRED_ETH_CONFIRMATIONS,
  BLOCK_EXPLORER_URL,
  SNOWBRIDGE_EXPLORER_URL,
  PERMITTED_ETH_NETWORK,
  PERMITTED_ETH_NETWORK_ID,
  BASIC_CHANNEL_ID,
  INCENTIVIZED_CHANNEL_ID,
  ACTIVE_CHANNEL,
  PARACHAIN_ETHER_ASSET_ID,
  INFURA_KEY,
  PARACHAIN_LIST
} = config;
