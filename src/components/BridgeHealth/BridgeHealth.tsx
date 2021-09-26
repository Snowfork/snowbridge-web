import React from 'react'; // we need this to make JSX compile
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import DOSButton from '../Button/DOSButton';
import Panel from '../Panel/Panel';
import { updateHealthCheck } from '../../redux/actions/bridgeHealth';
import { RootState } from '../../redux/store';
import { BridgeInfo } from '../../redux/reducers/bridgeHealth';

type BridgeHealthProps = {
  className?: string
}

const RenderBridgeInfo = (props:{heading: string, info: BridgeInfo}) => {
  return (
    <div>
      <span>{props.heading}</span>
      <table>
        <tbody>
          <tr>
            <td>Block Latency:</td>
            <td>{props.info.blocks.latency} blocks</td>
          </tr>
          <tr>
            <td>Last Block Update:</td>
            <td>{props.info.blocks.lastUpdated.toISOString()}</td>
          </tr>
          <tr>
            <td>Unconfirmed Messages:</td>
            <td>{props.info.messages.unconfirmed} messages</td>
          </tr>
          <tr>
            <td>Last Message Update:</td>
            <td>{props.info.messages.lastUpdated.toISOString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export const BridgeHealth = ({ className }: BridgeHealthProps) => {
  const {
    net: {
      web3,
      polkadotApi,
    },
    bridgeHealth: {
      polkadotToEthereum,
      ethereumToPolkadot
    },
  } = useSelector((state: RootState) => state);

  const dispatch = useDispatch();

  const handleTransferClicked = () => {
    dispatch(updateHealthCheck(web3,  polkadotApi));
  };


  return (
    <div className={className}>
      <Panel className="bridge-health-panel">
        <span>Bridge Health</span>
        <Panel className='bridge-health'>
          <RenderBridgeInfo heading="Polkadot -> Ethereum" info={polkadotToEthereum}/>
        </Panel>
        <Panel className='bridge-health'>
          <RenderBridgeInfo heading="Ethereum -> Polkadot" info={ethereumToPolkadot}/>
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
  text-align: center;

  .bridge-health-panel {
    width: 520px;
    align-items: center;
    gap: 15px;
  
    border: 1px solid ${props => props.theme.colors.transferPanelBorder};
    background: ${props => props.theme.colors.transferPanelBackground};
    margin-bottom: 16px;
  }

  .bridge-health {
    width: 75%;
  }

  span {
    display: inline-block;
    padding: 10px;
  }

  table {
    color: white;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 12px;
    letter-spacing: -0.04em;
    text-align: left;
    margin: 0 auto 0 auto;
  }
`;
