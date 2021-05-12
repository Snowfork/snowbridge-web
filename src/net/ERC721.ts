import { Contract } from 'web3-eth-contract';

/**
 * Queries a token contract to find the tokens owned by the user
 * token
 * @param {contractInstance} any The web3 contract instance for the ERC721 token
 * @return {Promise<[string]>} An array of token ids that are owned by the current user
 */
export async function fetchTokensForAddress(
  contractInstance: Contract,
  ownerAddress: string,
):
    Promise<string[]> {
  try {
    const balance = Number.parseFloat(
      await contractInstance.methods.balanceOf(ownerAddress).call(),
    );
    if (balance && balance > 0) {
      const proms = new Array(balance)
        .fill(null)
        .map(async (value, index) => {
          const tokenId = await contractInstance
            .methods
            .tokenOfOwnerByIndex(ownerAddress, index)
            .call();
          return tokenId.toString();
        });
      return Promise.all(proms);
    }

    return Promise.resolve([]);
  } catch (e) {
    console.log('error fetching nfts');
    throw e;
  }
}
