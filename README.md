# @snowfork/ethereum-bridge

A Bridge UI that enables the transfer of ETH and ERC20 tokens from Ethereum to Substrate via Metamask.

## Setup

### Start the local substrate chain

Set up instructions for local substrate chain are [here](https://github.com/Snowfork/polkadot-ethereum/tree/main/parachain).

```bash
# After setup, start chain
./target/release/artemis-node --dev
```

### Start a local Ethereum chain

Set up instructions for local ethereum chain are [here](https://github.com/Snowfork/polkadot-ethereum/tree/main/ethereum).
```bash
# After setup, start chain
truffle develop

# Compile contracts
truffle compile

# Migrate contracts to local network
truffle migrate
```

After migrating, plug the deployed ETHApp and ERC20App contract addresses into the app-polkadot-ethereum-bridge config.

### Start @snowfork/ethereum-bridge

First, install project dependencies.
```bash
# Must use node version >= 10.18
nvm install 10.18
nvm use 10.18

# Remove yarn lock before install deps
rm ./yarn.lock

# Install deps
yarn
```

Now we can start the application.
```bash
yarn start
```

Navigate to `http://127.0.0.1:3000` you're now able to deposit Ethereum into the deployed Bank contract 
using the asset-transfer user interface.

### Local testing

Using the metamask browser extension add a new development chain pointed at ethereum's local http endpoint called 'dev'. The local network's http endpoint is logged by the `truffle develop` command.

The `truffle develop` command also logs a list of accounts and private keys on initialization. Copy the private key of address 0 and use it to import a new account to metamask. You should see an account on the 'dev' chain loaded with ~100 ethereum. Your account is pre-loaded with thousands of TEST tokens. Once you've approved some tokens to the Bank contract, reload the page and you'll be able to deposit ERC20 tokens into the deployed Bank contract.

Note: to use the ERC20App you must use the private key of address 0 on the linked local ethereum network.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests]() for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!


### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
