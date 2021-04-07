import { Button } from '@material-ui/core';
import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

type Props = {
  children: ReactNode;
  isOpen: boolean;
  closeModal: () => void;
  buttonText: string;
};

function Modal({
  children, isOpen, closeModal, buttonText,
}: Props): JSX.Element {
  return (
    <div>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {children}
        <Button onClick={closeModal}>{buttonText}</Button>
      </ReactModal>
    </div>
  );
}

export default Modal;
