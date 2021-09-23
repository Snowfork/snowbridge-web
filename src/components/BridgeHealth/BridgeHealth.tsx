import React from 'react'; // we need this to make JSX compile
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import DOSButton from '../Button/DOSButton';
import Panel from '../Panel/Panel';
import { updateHealthCheck } from '../../redux/actions/bridgeHealth';
import { RootState } from '../../redux/store';

type BridgeHealthProps = {
  className?: string
}

export const BridgeHealth = ({ className }: BridgeHealthProps) => {
  const {
    net: {
      web3,
      polkadotApi,
    },
    bridgeHealth: {
      basicOutboundParachainNonce,
      basicOutboundEthNonce,
      basicInboundParachainNonce,
      basicInboundEthNonce,
      incentivizedOutboundParachainNonce,
      incentivizedOutboundEthNonce,
      incentivizedInboundParachainNonce,
      incentivizedInboundEthNonce,
      relaychainLatestBlock,
      ethLatestBeefyBlock,
      parachainLatestEthHeader,
      ethLatestBlock,
    },
  } = useSelector((state: RootState) => state);

  const dispatch = useDispatch();

  const handleTransferClicked = () => {
    dispatch(updateHealthCheck(web3,  polkadotApi));
  };

  return (
    <div className={className}>
      <Panel className="bridge-health-panel">
        <Panel className='bridge-health'>
          <h3>Bridge Health</h3>
          <h4>Channels</h4>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Parachain</th>
                <th>Eth</th>
                <th>Lag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Outbound Channel</td>
                <td>{basicOutboundParachainNonce}</td>
                <td>{basicOutboundEthNonce}</td>
                <td></td>
              </tr>
              <tr>
                <td>Basic Inbound Channel</td>
                <td>{basicInboundParachainNonce}</td>
                <td>{basicInboundEthNonce}</td>
                <td></td>
              </tr>
              <tr>
                <td>Incentivized Outbound Channel</td>
                <td>{incentivizedOutboundParachainNonce}</td>
                <td>{incentivizedOutboundEthNonce}</td>
                <td></td>
              </tr>
              <tr>
                <td>Incentivized Inbound Channel</td>
                <td>{incentivizedInboundParachainNonce}</td>
                <td>{incentivizedInboundEthNonce}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <h4>Light Clients</h4>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>RelayChain</th>
                <th>Eth</th>
                <th>Lag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Beefy</td>
                <td>{relaychainLatestBlock}</td>
                <td>{ethLatestBeefyBlock}</td>
                <td></td>
              </tr>
              <tr>
                <td>Ethereum</td>
                <td>{parachainLatestEthHeader}</td>
                <td>{ethLatestBlock}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <DOSButton onClick={handleTransferClicked}>
          Refresh
        </DOSButton>
      </Panel>
    </div>
  );
}

export default styled(BridgeHealth)`
  display: flex;
  align-items: center;
  justify-content: center;

  .bridge-health-panel {
    width: 520px;
    align-items: center;
    gap: 15px;
  
    border: 1px solid ${props => props.theme.colors.transferPanelBorder};
    background: ${props => props.theme.colors.transferPanelBackground};
    margin-bottom: 16px;
  }

  .bridge-health {
    text-align: center;
  }
`;
