import React, { useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '../../../utils/hooks';
import { getChainsFromDirection, getChainName } from '../../../utils/common';
import { Chain, Channel, SwapDirection } from '../../../types/types';
import { Asset } from '../../../types/Asset';
import { ACTIVE_CHANNEL, PERMITTED_METAMASK_NETWORK } from '../../../config';

import ToolTip from '../../ToolTip/ToolTip';
import { updateFees } from '../../../redux/actions/bridge';
import { useDispatch } from 'react-redux';

const toDotCurrency = { symbol: 'DOT', text: 'ERC20 DOT' };
const toETHCurrency = { symbol: 'ETH', text: 'Parachain ETH' };

const TRANSFER_FEE_ERROR = 'Not enough balance to pay for transfer fee';

const UNISWAP_DOT_LINK = `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x31256d975eea532992c26a8e8af332bfc98cfe41`
const SNOWBRIDGE_DISCORD_LINK = `https://discord.gg/9WHQUX7PT8`;

type Props = {
  className?: string;
  setError: (error: string) => void,
}

const FeeInfo = ({ className, setError }: Props) => {
  const {
    assets, swapDirection, fees
  } = useAppSelector((state) => state.bridge);

  const dispatch = useDispatch();

  const chains = getChainsFromDirection(swapDirection);
  const fromName = getChainName(chains.from)
  const toName = getChainName(chains.to)

  let fee: string | null;
  let currency: any;
  switch (chains.to) {
    case Chain.POLKADOT:
      fee = fees.erc20dot;
      currency = toDotCurrency;
      break;
    case Chain.ETHEREUM:
      fee = fees.parachainEth;
      currency = toETHCurrency;
      break;
  }
  
  const asset = assets.find((asset) => asset.symbol === currency.symbol);
  const balance = asset ? asset.balance[chains.from] : 0;
  let balanceError = false;
  if (fee !== null && balance < fee) {
    balanceError = true;
  }

  useEffect(() => {
    const checkFeeBalance = (assets: Asset[], swapDirection: SwapDirection) => {
      const chains = getChainsFromDirection(swapDirection);
     
      let fee: string | null;
      let currency: any;
      switch (chains.to) {
        case Chain.POLKADOT:
          fee = fees.erc20dot;
          currency = toDotCurrency;
          break;
        case Chain.ETHEREUM:
          fee = fees.parachainEth;
          currency = toETHCurrency;
          break;
      }

      const asset = assets.find((asset) => asset.symbol === currency.symbol);
      const balance = asset ? asset.balance[chains.from] : 0;
      if (fee !== null && balance < fee) {
        setError(TRANSFER_FEE_ERROR);
      }
      else {
        setError('');
      }
    };

    checkFeeBalance(assets, swapDirection);
  }, [assets, swapDirection, fees.erc20dot, fees.parachainEth]);

  useEffect(() => {
    dispatch(updateFees());
  }, [swapDirection]);

  useEffect(() => {
    if(fees.error) {
      setError(fees.error);
    } else {
      setError('');
    }
  }, [fees.error]);

  if(fee === null) {
    return (
      <div className={className}>
        {!fees.error && <div className='fee-display-section'>
        <span>Transfer fee</span>
        <span className='fee-amount'>
          Loading...
        </span>
        </div>}
        {fees.error && <div className='fee-error-section'>
          {fees.error}
        </div>}
      </div>
    );
  }

  const toolTip = `To make transfers to ${toName}, you need to pay ${fee} ${currency.text} from your ${fromName} wallet`

  if (ACTIVE_CHANNEL !== Channel.INCENTIVIZED) {
    return null;
  }

  return (
    <div className={className}>
      <div className='fee-display-section'>
        <span>Transfer fee</span>
        <span className='fee-amount'>
          {fee} {currency.text}
          <ToolTip className='fee-tooltip' text={toolTip} />
        </span>
      </div>
      {balanceError && <div className='fee-error-section'>
        <p>You don't have enough {currency.text} in your {fromName} wallet to pay for this transfer.</p>
        {currency.symbol === toDotCurrency.symbol && <p>
          If this is your first time using the bridge, you can get some <a rel="noopener noreferrer" className='feeinfo-link' target='_blank' href={UNISWAP_DOT_LINK}>here</a> from Uniswap <i> (Make sure you're on {PERMITTED_METAMASK_NETWORK}!)</i>, but the best way to get it is to bridge it over from {toName} yourself. You can also ask for some in our <a rel="noopener noreferrer" className='feeinfo-link' target='_blank' href={SNOWBRIDGE_DISCORD_LINK}>Discord Support channel</a>.
        </p>}
        {currency.symbol === toETHCurrency.symbol && <p>
          If this is your first time using the bridge, you should bridge it over from {toName} yourself! You can also ask for some in our <a rel="noopener noreferrer" className='feeinfo-link' target='_blank' href={SNOWBRIDGE_DISCORD_LINK}>Discord Support channel</a>.
        </p>}
      </div>}
    </div>
  );
};

export default styled(FeeInfo)`
  width: auto;
  min-width: 370px;

  .fee-display-section {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    font-size: 14px;
    align-items: center;
    width: 100%;
  }

  .fee-amount {
    display: flex;
    align-items: center;
  }

  .fee-error-section {
    border: 1px solid ${({ theme }) => theme.colors.errorBackground};
    border-radius: ${({ theme }) => theme.borderRadius};

    padding: 5px;

    font-size: 12px;

    text-align: center;
    color: ${({ theme }) => theme.colors.errorBackground};
    margin-top: 10px;

    .feeinfo-link {
      font-family: SF UI Text Bold;
      color ${({ theme }) => theme.colors.stepComplete};
    }

  }
`
