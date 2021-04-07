import Web3 from 'web3';
import { ss58ToU8 } from '../net/api';

import { Token } from '../types';

const INCENTIVIZED_CHANNEL_ID = 1;

/**
 * Queries a token contract to find the number of decimals supported by the
 * token
 * @param {contractInstance} any The web3 contract instance for the ERC20 token
 * @return {Promise<number>} The number of decimals supported by the token
 */
export async function fetchERC20Decimals(contractInstance: any)
  : Promise<number> {
  return Number(await contractInstance.methods.decimals().call());
}

/**
 * Queries a token contract to find the spend allowance for a given address
 * @param {tokenContractInstance} any The web3 contract instance for the
 * ERC20 token
 * @param {userAddress} string The eth address of the users wallet
 * @param {ERC20BridgeContractAddress} string The eth address of the ERC20
 * bridge contract
 * @return {Promise<number>} The spend allowance of the given token for the
 *  given userAddress
 */
export async function fetchERC20Allowance(
  tokenContractInstance: any,
  userAddress: string,
  ERC20BridgeContractAddress: string,
): Promise<number> {
  const allowance: number = await tokenContractInstance.methods
    .allowance(userAddress, ERC20BridgeContractAddress)
    .call();
  return allowance;
}

/**
 * Queries a token contract to find the balance for a given address
 * @param {tokenContractInstance} any The web3 contract instance for the
 * ERC20 token
 * @param {userAddress} string The eth address of the users wallet
 * @return {Promise<number>} The balance of the given token for the given
 *  userAddress
 */
export async function fetchERC20Balance(
  tokenContractInstance: any,
  userAddress: string,
): Promise<number> {
  const balance: number = await tokenContractInstance.methods
    .balanceOf(userAddress)
    .call();
  return balance;
}

/**
 * Queries an ERC20 token contract to return the name of the token
 * @param {tokenContractInstance} any The ERC20 token contract instance
 * @return {Promise<string>} The name of the token
 */
export async function fetchERC20Name(tokenContractInstance: any)
  : Promise<string> {
  const name = await tokenContractInstance.methods.name().call();
  return name;
}

/**
 * Approve the spender address for spending the owners ERC20 tokens
 * @param {ERC20ContractInstance} any The ERC20 token contract instance
 * @param {spenderAddress} string The eth address to grant spending permission
 * @param {ownderAddress} string The eth address of the owner who wishes to
 * grant permission to the spender
 * @param {approvaAmount} number The amount to approve for spending (in wei)
 * @return {Promise<void>}
 */
export async function approveERC20(
  ERC20ContractInstance: any,
  spenderAddress: any,
  ownerAddress: any,
  approvalAmount: string,
): Promise<void> {
  return ERC20ContractInstance.methods
    .approve(spenderAddress, approvalAmount)
    .send({
      from: ownerAddress,
      gas: 500000,
      value: 0,
    });
}

/**
 *
 * @param senderEthAddress The users eth wallet address
 * @param polkadotRecipientBytes The users polkadot wallet address
 * @param ERC20ContractInstance The ERC20 token contract instance
 * @param bridgeContractInstance The ERC20 bridge contract instance
 * @param amount The amount of ERC20 tokens to transfer to polkadot
 */
export async function lockERC20(
  senderEthAddress: string,
  polkadotRecipientAddress: string,
  ERC20ContractInstance: any,
  bridgeContractInstance: any,
  amount: number,
): Promise<void> {
  const polkadotRecipientBytes: Uint8Array = ss58ToU8(
    polkadotRecipientAddress,
  );

  return bridgeContractInstance
    .methods
    .lock(
      // eslint-disable-next-line no-underscore-dangle
      ERC20ContractInstance._address,
      polkadotRecipientBytes,
      `${amount}`,
      INCENTIVIZED_CHANNEL_ID,
    )
    .send({
      from: senderEthAddress,
      gas: 500000,
      value: 0,
    });
}

// util methods

/**
 * Converts human readable amount into units native to the contract
 * @param contractInstance
 * @param amount
 * @return {Promise<number>}
 */
export async function addDecimals(token: Token, amount: string)
  : Promise<string> {
  const bnAmount = Web3.utils.toBN(amount);
  const bnDecimals = Web3.utils.toBN(token.decimals);
  const bnDecimalsMultiplier = Web3.utils.toBN(10).pow(bnDecimals);
  return bnAmount.mul(bnDecimalsMultiplier).toString();
}

/**
 * Converts native contract units into a human readable number
 * @param contractInstance
 * @param amount
 * @return {Promise<number>}
 */
export async function removeDecimals(contractInstance: any, amount: number)
  : Promise<number> {
  const decimals = await fetchERC20Decimals(contractInstance);
  return amount / 10 ** decimals;
}
