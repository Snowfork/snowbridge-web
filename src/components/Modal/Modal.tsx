import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

import styled from 'styled-components';

import Panel from '../Panel/Panel';

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onRequestClose: () => void;
  className?: string;
  type?: string | undefined;
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
    padding: '0',
    border: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  }
};

function Modal({
  children,
  isOpen,
  onRequestClose,
  className,
}: Props): JSX.Element {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
    >
      <Panel className={className}>
        {children}
      </Panel>
    </ReactModal>
  );
}

export default styled(Modal)`
  display: flex;
  align-items: flex-start;
  justify-content: center;

  border: 1px solid ${props => props.theme.colors.transferPanelBorder};
  background: ${props => props.type === 'error' ?
    props.theme.colors.errorBackground :
    props.theme.colors.transferPanelBackground};
`;
