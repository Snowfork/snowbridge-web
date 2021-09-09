import React from 'react';
import {
  Grid,
  Paper,
  makeStyles,
  Theme,
  createStyles,
  useTheme,
  Button,
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { useAppSelector } from '../../utils/hooks';
import { NonFungibleToken } from '../../types/Asset';

type Props = {
  setShowAssetSelector: (show: boolean) => void,
}

export const SelectedNFT = ({ setShowAssetSelector }: Props) => {

  const {
    selectedAsset,
  } = useAppSelector((state) => state.bridge);

  const theme = useTheme();

  const useStyles = makeStyles((theme: Theme) => createStyles({
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
  }));
  const classes = useStyles(theme);

  const token = (selectedAsset?.token as NonFungibleToken);

  return (
    <Grid item>
      {/* amount input */}
      <Grid item>
        <Paper className={classes.amountInput}>
          <Button onClick={() => setShowAssetSelector(true)}>
            {selectedAsset?.name}:{token.subId || token?.ethId}
            <ExpandMoreIcon />
          </Button>
        </Paper>
      </Grid>

    </Grid>
  );
};
