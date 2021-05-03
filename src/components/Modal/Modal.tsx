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
  onClose: () => void;
};

function Modal({
  children,
  isOpen,
  onClose,
}: Props): JSX.Element {
  return (
    <div>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {children}
      </ReactModal>
    </div>
  );
}

export default Modal;
