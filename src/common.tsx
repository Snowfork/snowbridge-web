import {ApiPromise} from "@polkadot/api";

interface AccountData {
  [free: string]: any;
}

// Query account balance for bridged assets (ETH and ERC20)
async function queryPolkaEthBalance(
  api: ApiPromise,
  assetId: string,
  accountId: string,
) {
  let accountData = await api.query.asset.account(assetId, accountId);

  if (accountData && (accountData as AccountData).free) {
    return (accountData as AccountData).free;
  }

  return null;
}

export default queryPolkaEthBalance;
