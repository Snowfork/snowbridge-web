import { Contract } from 'web3-eth-contract';
import { OwnedNft } from '../types/types';

/**
 * Queries a token contract to find the tokens owned by the user
 * token
 * @param {contractInstance} any The web3 contract instance for the ERC721 token
 * @return {Promise<[OwnedNft]>} An array of tokens that are owned by the current user
 */
export async function fetchTokensForAddress(
  contractInstance: Contract,
  ownerAddress: string,
):
    Promise<OwnedNft[]> {
  try {
    const balance = Number.parseFloat(
      await contractInstance.methods.balanceOf(ownerAddress).call(),
    );
    if (balance && balance > 0) {
      // fetch name
      const name = await contractInstance.methods.name().call();

      const proms = new Array(balance)
        .fill(null)
        .map(async (value, index) => {
          const tokenId = await contractInstance
            .methods
            .tokenOfOwnerByIndex(ownerAddress, index)
            .call();

          // fetch tokenURI
          const tokenURI = await contractInstance
            .methods
            .tokenURI(tokenId)
            .call();

          const nft: OwnedNft = {
            address: contractInstance.options.address,
            id: tokenId.toString(),
            name,
            tokenURI,
          };

          return nft;
        });
      return Promise.all(proms);
    }

    return Promise.resolve([]);
  } catch (e) {
    console.log('error fetching nfts');
    throw e;
  }
}
