import React, { useEffect } from 'react'; // we need this to make JSX compile
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Panel from '../Panel/Panel';
import { startHealthCheckPoll } from '../../redux/actions/bridgeHealth';
import { RootState } from '../../redux/store';
import { bridgeHealthSlice, BridgeInfo } from '../../redux/reducers/bridgeHealth';
import DOSButton from '../Button/DOSButton';
import Modal from '../Modal';

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
      lastUpdated,
      isOpen,
      error,
      errorMessage,
      loading,
      polkadotToEthereum,
      ethereumToPolkadot
    }
  } = useSelector((state: RootState) => state);

  const closeTab = () => {
    dispatch(bridgeHealthSlice.actions.setOpen(false));
  }

  const refreshTab = () => {
    dispatch(bridgeHealthSlice.actions.setLoading(true));
    dispatch(startHealthCheckPoll(web3, polkadotApi));
  };

  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(startHealthCheckPoll(web3, polkadotApi));
  }, []);

  return (
    <Modal isOpen={isOpen} onRequestClose={closeTab} className={className}>
      { 
        (!error && loading) && (
          <>
            <div>Loading...</div>
            <DOSButton onClick={closeTab}>Close</DOSButton>
          </>
        )
      }
      { 
        (error) && (
          <>
            <div>{errorMessage}</div>
            <DOSButton onClick={refreshTab}>Refresh</DOSButton>
            <DOSButton onClick={closeTab}>Close</DOSButton>
          </>
        )
      }
      { 
        (!error && !loading) && (
          <>
            <span>Bridge Health</span>
            <Panel className='bridge-health'>
              <RenderBridgeInfo heading="Polkadot -> Ethereum" info={polkadotToEthereum}/>
            </Panel>
            <Panel className='bridge-health'>
              <RenderBridgeInfo heading="Ethereum -> Polkadot" info={ethereumToPolkadot}/>
            </Panel>
            <div>Last updated {lastUpdated.toISOString()}</div>
            <DOSButton onClick={closeTab}>Close</DOSButton>
          </>
        )
      }
    </Modal>
  );
}

export default styled(BridgeHealth)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 500px;

  .bridge-health {
    width: 80%;
  }

  span {
    display: inline-block;
    padding: 10px;
  }

  table {
    color: ${props => props.theme.colors.secondary};
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 12px;
    letter-spacing: -0.04em;
    text-align: left;
    margin: 0 auto 0 auto;
  }
`;
