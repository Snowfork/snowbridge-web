import { ApiPromise } from '@polkadot/api';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Chain, OwnedNft } from '../types/types';
import * as ERC721 from '../contracts/TestToken721.json';

/**
 * Uses ERC165 to check if a contract implements IERC721Enumerable (0x780e9d63)
 * @param contract
 */
export async function isEnumerable(contract: Contract) : Promise<boolean> {
  const IERC721EnumerableSelector = '0x780e9d63';
  return contract.methods.supportsInterface(IERC721EnumerableSelector).call();
}

/**
 * Queries a token contract to find the tokens owned by the user on Ethereum
 * token
 * @param {contractInstance} any The web3 contract instance for the ERC721 token
 * @return {Promise<[OwnedNft]>} An array of tokens that are owned by the current user
 */
export async function fetchTokens(
  contractInstance: Contract,
  ownerEthAddress: string,
):
    Promise<OwnedNft[]> {
  try {
    // fetch tokens on ethereum
    let ethTokens: OwnedNft[] = [];
    const isEnum = await isEnumerable(contractInstance);
    if (isEnum) {
      const balance = Number.parseFloat(
        (await contractInstance.methods.balanceOf(ownerEthAddress).call()).toString(),
      );
      if (balance && balance > 0) {
      // fetch name
        const name = await contractInstance.methods.name().call();

        const proms = new Array(balance)
          .fill(null)
          .map(async (value, index): Promise<OwnedNft> => {
            let ethId;
            let tokenURI;
            if (isEnum) {
              ethId = await contractInstance
                .methods
                .tokenOfOwnerByIndex(ownerEthAddress, index)
                .call();

            // // check if supports IERC721URIStorange and query tokenURI
            // tokenURI = await contractInstance
            //   .methods
            //   .tokenURI(ethId)
            //   .call();
            }

            const nft: OwnedNft = {
              address: contractInstance.options.address,
              ethId,
              name: name.toString(),
              tokenURI,
              chain: Chain.ETHEREUM,
            };

            return nft;
          });
        ethTokens = ethTokens.concat(await Promise.all(proms));
      }
    }

    return ethTokens;
  } catch (e) {
    console.log('error fetching nfts here');
    throw e;
  }
}

export async function approveERC721(
  contractInstance: Contract,
  id: string,
  spenderAddress: string,
  ownerAddress: string,
): Promise<void> {
  return contractInstance.methods.approve(
    spenderAddress,
    id,
  ).send({
    from: ownerAddress,
  });
}

export async function getApproved(
  contractInstance: Contract,
  id: string,
): Promise<string> {
  return contractInstance.methods.getApproved(id).call();
}

/**
 * Queries a token contract to find the tokens owned by the user on Ethereum
 * token
 * @param {contractInstance} any The web3 contract instance for the ERC721 token
 * @return {Promise<[OwnedNft]>} An array of tokens that are owned by the current user
 */
export async function fetchTokensOnPolkadot(
  polkadotApi: ApiPromise,
  web3: Web3,
  ownerPolkadotAddress: string,
):
    Promise<OwnedNft[]> {
  try {
    const polkadotTokens: OwnedNft[] = [];
    const polkadotAddress = ownerPolkadotAddress.toString();

    const tokensByOwner = await polkadotApi
      .query
      .nft
      .tokensByOwner
      .entries(polkadotAddress);

    const tokenDetails = tokensByOwner
      .map(async ([key]) => {
        const id = key.args[1].toString();
        const tokenData = (await polkadotApi.query.nft.tokens(id)).toJSON() as any;
        const address = tokenData?.data?.tokenContract.toString();
        const contractInstance = new web3.eth.Contract(ERC721.abi as any, address);
        const name = await contractInstance.methods.name().call();

        return {
          subId: id,
          ethId: tokenData?.data?.tokenId.toString(),
          address,
          name,
        };
      });

    await Promise.all(tokenDetails).then((tokens) => {
      tokens.forEach((token) => polkadotTokens.push({
        address: token.address,
        chain: Chain.POLKADOT,
        name: token.name,
        ethId: token.ethId,
        polkadotId: token.subId,
      }));
    });

    return polkadotTokens;
  } catch (e) {
    console.log('error fetching nfts');
    throw e;
  }
}
