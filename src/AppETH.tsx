// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import {
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  FormHelperText,
  Divider
} from '@material-ui/core';

const { Keyring } = require('@polkadot/keyring');
const {u8aToHex} = require('@polkadot/util');

// ------------------------------------------
//                  Props
// ------------------------------------------
type Props = {
  web3: Web3,
  contract: Contract,
  defaultAccount: string
}

// ------------------------------------------
//               AppETH component
// ------------------------------------------
function AppETH ({ contract, defaultAccount, web3 }: Props): React.ReactElement<Props> {

  // State    
  const [polkadotRecipient, setPolkadotRecipient] = useState(String);
  const [depositAmount, setDepositAmount] = useState(String);

  if(!defaultAccount || defaultAccount === "") {
    return(<p>Default MetaMask Account is undefined!</p>);
  }

  // Handlers
  const handleSendETH = () => {
    const execute = async (ss58Recipient: string, amount: string) => {

      // create a keyring with default options
      const keyring = new Keyring();

      // SS58 formated address to hexadecimal format
      const hexRecipient = keyring.decodeAddress(ss58Recipient);

      // hexadecimal formated Address to raw bytes
      const rawRecipient = u8aToHex(hexRecipient, -1, false);

      const recipientBytes = Buffer.from(rawRecipient, 'hex');
        await contract.methods.sendETH(recipientBytes).send({
          from: defaultAccount,
          gas: 500000,
          value: web3.utils.toWei(amount, 'ether')
      });           
    };

    execute(polkadotRecipient, depositAmount);
  };

  // Render
  return (
      <Grid container >
        <Grid container item xs={10} md={8} justify='center' spacing={3}
          style={{margin: '0 auto', padding: '2em 0', border: 'thin solid #E0E0E0'}}>

          <Grid item xs={10}>
            <Typography gutterBottom variant='h5'>
              ETH App
            </Typography>
          </Grid>

          { /* SS58 Address Input */ }
          <Grid item xs={10} >
            <FormControl>
              <Typography gutterBottom>
                To
              </Typography>
              <TextField
                InputProps={{
                  value: polkadotRecipient
                }}
                id='eth-input-recipient'
                margin='normal'
                onChange={(e) => setPolkadotRecipient(e.target.value)}
                placeholder={'38j4dG5GzsL1bw...'}
                style={{ margin: 5}}
                variant='outlined'
              />
             <FormHelperText id="ss58InputDesc">
               What account would you like to fund on Polkadot?
             </FormHelperText>
           </FormControl>
         </Grid>

         { /* ETH Deposit Amount Input */ }
         <Grid item xs={10}>
           <FormControl>
             <Typography gutterBottom>
               Amount
             </Typography>
             <TextField
               InputProps={{
                 value: depositAmount
               }}
               id='eth-input-amount'
               margin='normal'
               onChange={(e) => setDepositAmount(e.target.value)}
               placeholder='0.00 ETH'
               style={{ margin: 5 }}
               variant='outlined'
             />
             <FormHelperText id="ethAmountDesc">
               How much ETH would you like to deposit?
             </FormHelperText>
           </FormControl>
         </Grid>

         { /* Send ETH */ }
         <Grid item xs={10}>
           <Button
             color='primary'
             onClick={() => handleSendETH()}
             variant='outlined'>
             <Typography variant='button'>
               Send ETH
             </Typography>
           </Button>
         </Grid>
       </Grid>
       <Divider />
     </Grid>
  );
}

export default React.memo(styled(AppETH)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
