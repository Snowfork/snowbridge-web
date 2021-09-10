import React, { useEffect } from 'react';
import {
  Typography,
  Grid,
  Paper,
  makeStyles,
  Theme,
  createStyles,
  InputBase,
  Divider,
  useTheme,
  Button,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import {
  setDepositAmount, updateBalances,
} from '../../redux/actions/bridge';

import { REFRESH_INTERVAL_MILLISECONDS } from '../../config';
import {
  tokenBalancesByNetwork,
} from '../../redux/reducers/bridge';
import FormatAmount from '../FormatAmount';

import { decimals, symbols } from '../../types/Asset';
import { useAppSelector } from '../../utils/hooks';

const INSUFFICIENT_BALANCE_ERROR = 'Insufficient funds';

type Props = {
  setShowAssetSelector: (show: boolean) => void,
  setError: (error: string) => void,
}

export const SelectedFungibleToken = ({ setShowAssetSelector, setError }: Props) => {
  // state
  const tokenBalances = useAppSelector(tokenBalancesByNetwork);

  const {
    selectedAsset,
    depositAmount,
    swapDirection,
  } = useAppSelector((state) => state.bridge);

  const theme = useTheme();
  const dispatch = useDispatch();
  const decimalMap = decimals(selectedAsset, swapDirection);

  // poll APIs to keep balances up to date
  useEffect(() => {
    function startPolling() {
      return setInterval(() => {
        dispatch(updateBalances());
      }, REFRESH_INTERVAL_MILLISECONDS);
    }

    const interval = startPolling();

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

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

  const handleMaxClicked = () => {
    const amount = tokenBalances.sourceNetwork;
    const depositAmountFormatted = utils.formatUnits(amount, decimalMap.from);
    checkAndSetDepositAmount(depositAmountFormatted)
  };

  const handleDepositAmountChanged = (e: any) => {
    if (e.target.value) {
      checkAndSetDepositAmount(e.target.value);
    } else {
      checkAndSetDepositAmount('');
    }
  };

  const checkAndSetDepositAmount = (amount: string) => {
    if (amount
      && decimalMap.from
      && new BigNumber(
        // make sure we are comparing the same units
        utils.parseUnits(
          amount || '0', decimalMap.from,
        ).toString(),
      )
        .isGreaterThan(
          new BigNumber(tokenBalances.sourceNetwork),
        )
    ) {
      setError(INSUFFICIENT_BALANCE_ERROR);
    } else {
      setError('');
    }
    dispatch(setDepositAmount(amount));
  }

  return (
    <Grid item>
      {/* amount input */}
      <Grid item>
        <Paper className={classes.amountInput}>
          <InputBase
            className={classes.input}
            placeholder="0.0"
            inputProps={{ 'aria-label': '0.0', min: 0 }}
            value={depositAmount}
            onChange={handleDepositAmountChanged}
            type="number"
          />
          <Button size="small" onClick={handleMaxClicked}>MAX</Button>
          <Divider className={classes.divider} orientation="vertical" />
          <Button onClick={() => setShowAssetSelector(true)}>
            {selectedAsset?.name}
            <ExpandMoreIcon />
          </Button>
        </Paper>
      </Grid>

      <Grid item container justifyContent="space-between">
        <Grid item>
          <Typography gutterBottom variant="caption">
            Available Balance:
          </Typography>
          <Typography gutterBottom>
            {
              selectedAsset
              && (
                <FormatAmount
                  amount={tokenBalances.sourceNetwork}
                  decimals={decimalMap.from}
                />
              )
            }
            {' '}
            {
              selectedAsset && symbols(selectedAsset, swapDirection).from
            }
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};
