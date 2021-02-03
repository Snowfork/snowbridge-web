/**
 * Queries a token contract to find the number of decimals supported by the token
 * @param {contractInstance} any The web3 contract instance for the ERC20 token
 * @return {Promise<number>} The number of decimals supported by the token
 */
export async function fetchERC20Decimals(contractInstance: any): Promise<number> {
    return Number(await contractInstance.methods.decimals().call());
}

/**
 * Queries a token contract to find the spend allowance for a given address
 * @param {tokenContractInstance} any The web3 contract instance for the ERC20 token
 * @param {userAddress} string The eth address of the users wallet
 * @param {ERC20BridgeContractAddress} string The eth address of the ERC20 bridge contract
 * @return {Promise<number>} The spend allowance of the given token for the given userAddress
 */
export async function fetchERC20Allowance(tokenContractInstance: any, userAddress: string, ERC20BridgeContractAddress: string): Promise<number> {
    const allowance: number = await tokenContractInstance.methods
        .allowance(userAddress, ERC20BridgeContractAddress)
        .call()
    return allowance
}

/**
 * Queries a token contract to find the balance for a given address
 * @param {tokenContractInstance} any The web3 contract instance for the ERC20 token
 * @param {userAddress} string The eth address of the users wallet
 * @return {Promise<number>} The balance of the given token for the given userAddress
 */
export async function fetchERC20Balance(tokenContractInstance: any, userAddress: string): Promise<number> {
    const balance: number = await tokenContractInstance.methods
        .balanceOf(userAddress)
        .call()
    return balance
}

/**
 * Queries an ERC20 token contract to return the name of the token
 * @param {tokenContractInstance} any The ERC20 token contract instance
 * @return {Promise<string>} The name of the token
 */
export async function fetchERC20Name(tokenContractInstance: any): Promise<string> {
    const name = await tokenContractInstance.methods.name().call();
    return name;
}
