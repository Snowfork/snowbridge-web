// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Paper,
  makeStyles,
  Theme,
  createStyles,
  useTheme,
} from '@material-ui/core';
import { useAppSelector } from '../../utils/hooks';
import ConfirmTransactionModal from '../ConfirmTransactionModal';
import SelectTokenModal from '../SelectTokenModal';
import { FungibleTokens } from './FungibleTokens';

// ------------------------------------------
//               Bank component
// ------------------------------------------
function Bridge(): React.ReactElement {
  // state
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const { showConfirmTransactionModal } = useAppSelector((state) => state.bridge);

  const theme = useTheme();

  const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto',
      maxWidth: 400,
    },
    amountInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto',
      marginBottom: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      margin: '0 auto',
      maxWidth: 500,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    divider: {
      height: 28,
      margin: 4,
    },
    transfer: {
      width: '100%',
    },
    switch: {
      margin: 'auto',
    },
  }));
  const classes = useStyles(theme);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <FungibleTokens setShowAssetSelector={setShowAssetSelector} />
      </Paper>
      <SelectTokenModal
        open={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
      />
      <ConfirmTransactionModal
        open={showConfirmTransactionModal}
      />
    </div>
  );
}

export default styled(Bridge)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`;
