import Web3 from "web3";

/**
 * Get default web3 account
 * @param {web3} Web3 web3 instance
 * @return {Promise<string>} The default web3 account
 */
export async function getAddress(web3: Web3): Promise<string> {
    try {
        const accs = await web3.eth.getAccounts();

        if (accs) {
            return accs[0];
        } else {
            throw new Error('Ethereum Account Not Set');
        }
    } catch (err) {
        console.log(err);
        throw new Error('Ethereum Account Not Set');
    }
}

/**
 * Get ETH balance of default Ethereum account
 * @param {web3} Web3 web3 instance
 * @return {Promise<string>} The default web3 account
 */
export async function getBalance(conn: Web3): Promise<string> {
    try {
        if (conn) {
            let default_address = await getAddress(conn);

            if (default_address) {
                const currentBalance = await conn.eth.getBalance(default_address);

                if (currentBalance) {
                    return parseFloat(conn.utils.fromWei(currentBalance)).toFixed(4);
                }

                throw new Error('Balance not found');
            }

            throw new Error('Default Address not found');
        } else {
            throw new Error('Web3 API not connected');
        }
    } catch (err) {
        console.log(err);
        throw new Error('Error reading balance');

    }
}

/**
* Lockup Token To Selected Polkadot Account via Incentivized Channel
* @param {web3} Web3 web3 instance
* @param {amount} string The amount of the token to lock on ethereum
* @param {address} string The eth address of the sender
* @return {Promise<string>} The default web3 account
*/
