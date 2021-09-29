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

const formatTime = (time: Date | null, bestGuess: boolean, relative: boolean, now: Date) => {
 return time?.toISOString() ?? "unavailable";
}

const RenderBridgeInfo = (props:{heading: string, info: BridgeInfo, time: Date}) => {
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
            <td>{formatTime(props.info.blocks.lastUpdated, props.info.blocks.lastUpdatedBestGuess, props.info.blocksRelativeTime, props.time)}</td>
          </tr>
          <tr>
            <td>Unconfirmed Messages:</td>
            <td>{props.info.messages.unconfirmed} messages</td>
          </tr>
          <tr>
            <td>Last Message Update:</td>
            <td>{formatTime(props.info.messages.lastUpdated, props.info.messages.lastUpdatedBestGuess, props.info.messagesRelativeTime, props.time)}</td>
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
      polkadotRelayApi,
    },
    bridgeHealth: {
      lastUpdated,
      lastUpdatedRelative,
      isOpen,
      hasError,
      errorMessage,
      isLoading,
      polkadotToEthereum,
      ethereumToPolkadot
    }
  } = useSelector((state: RootState) => state);

  const closeTab = () => {
    dispatch(bridgeHealthSlice.actions.setOpen(false));
  }

  const refreshTab = () => {
    dispatch(bridgeHealthSlice.actions.setLoading(true));
    dispatch(startHealthCheckPoll(web3, polkadotApi, polkadotRelayApi));
  };

  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(startHealthCheckPoll(web3, polkadotApi, polkadotRelayApi));
  }, []);

  const now = new Date(Date.now());

  return (
    <Modal isOpen={isOpen} onRequestClose={closeTab} className={className}>
      { 
        (!hasError && isLoading) && (
          <>
            <div>Loading...</div>
            <DOSButton onClick={closeTab}>Close</DOSButton>
          </>
        )
      }
      { 
        (hasError) && (
          <>
            <div>{errorMessage}</div>
            <DOSButton onClick={refreshTab}>Refresh</DOSButton>
            <DOSButton onClick={closeTab}>Close</DOSButton>
          </>
        )
      }
      { 
        (!hasError && !isLoading) && (
          <>
            <span>Bridge Health</span>
            <Panel className='bridge-health'>
              <RenderBridgeInfo heading="Polkadot -> Ethereum" info={polkadotToEthereum} time={now}/>
            </Panel>
            <Panel className='bridge-health'>
              <RenderBridgeInfo heading="Ethereum -> Polkadot" info={ethereumToPolkadot} time={now}/>
            </Panel>
            <div>Last updated {formatTime(lastUpdated, false, lastUpdatedRelative, now)}</div>
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
