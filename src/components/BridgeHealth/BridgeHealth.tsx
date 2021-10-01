import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Panel from '../Panel/Panel';
import { startHealthCheckPoll } from '../../redux/actions/bridgeHealth';
import { RootState } from '../../redux/store';
import { bridgeHealthSlice, BridgeInfo } from '../../redux/reducers/bridgeHealth';
import DOSButton from '../Button/DOSButton';
import Modal from '../Modal';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

const StyledModal = styled(Modal)`
  height: 100vh;
  max-height: 560px;
`;

type BridgeHealthProps = {
  className?: string
}

const formatTime = (time: Date | null, bestGuess: boolean, now: Date) => {
  if(time == null) {
    return "unavailable";
  }

  const relativeTime = moment(time).from(moment(now));
  if(bestGuess) {
    return "more than " + relativeTime;
  }
  return relativeTime;
}

const RenderBridgeInfo = (props: { heading: string, info: BridgeInfo, time: Date }) => {
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
            <td>{formatTime(props.info.blocks.lastUpdated, props.info.blocks.lastUpdatedBestGuess, props.time)}</td>
          </tr>
          <tr>
            <td>Unconfirmed Messages:</td>
            <td>{props.info.messages.unconfirmed > 0 ? props.info.messages.unconfirmed + ' messages' : 'All up to date'}</td>
          </tr>
          <tr>
            <td>Last Message Update:</td>
            <td>{formatTime(props.info.messages.lastUpdated, props.info.messages.lastUpdatedBestGuess, props.time)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export const BridgeHealth = ({ className }: BridgeHealthProps) => {
  const {
    lastUpdated,
    hasError,
    errorMessage,
    isLoading,
    polkadotToEthereum,
    ethereumToPolkadot,
  } = useSelector((state: RootState) => state.bridgeHealth);

  const history = useHistory();
  const onRequestClose = () => history.push('/');

  const dispatch = useDispatch();
  const refreshTab = () => {
    dispatch(bridgeHealthSlice.actions.setLoading(true));
    dispatch(startHealthCheckPoll());
  };

  const now = new Date(Date.now());

  return (
    <StyledModal isOpen onRequestClose={onRequestClose} className={className}>
      {
        (!hasError && isLoading) && (
          <>
            <div>Loading...</div>
            <DOSButton onClick={onRequestClose}>Close</DOSButton>
          </>
        )
      }
      {
        (hasError) && (
          <>
            <div>{errorMessage}</div>
            <DOSButton onClick={refreshTab}>Refresh</DOSButton>
            <DOSButton onClick={onRequestClose}>Close</DOSButton>
          </>
        )
      }
      {
        (!hasError && !isLoading) && (
          <>
            <span>Bridge Health</span>
            <Panel className='bridge-health'>
              <RenderBridgeInfo heading="Polkadot -> Ethereum" info={polkadotToEthereum} time={now} />
            </Panel>
            <Panel className='bridge-health'>
              <RenderBridgeInfo heading="Ethereum -> Polkadot" info={ethereumToPolkadot} time={now} />
            </Panel>
            <div>Last updated {formatTime(lastUpdated, false, now)}</div>
            <DOSButton onClick={onRequestClose}>Close</DOSButton>
          </>
        )
      }
    </StyledModal>
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
