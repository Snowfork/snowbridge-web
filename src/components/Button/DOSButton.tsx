import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import LoadingSpinner from '../LoadingSpinner';

type Props = {
  className?: string;
  onClick?: any;
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
}

const DOSButton = ({ className, onClick, disabled, loading, loadingMessage, children }: React.PropsWithChildren<Props>) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      className={className}>
      <div className="button-frame">
        {children}
        {
          loading && <div className="dosbutton-loading" >
            <LoadingSpinner spinnerWidth="40px" spinnerHeight="40px" inverted={true} />
            <div className="dosbutton-loading-message">{loadingMessage}</div>
          </div>
        }
      </div>
    </Button>
  );
};

export default styled(DOSButton)`
  width: 300px;

  .button-frame {
    border: 1px solid ${props => props.theme.colors.transferPanelBorder};
    width: calc(100% - 22px);
    padding: 10px;
  }

  .dosbutton-loading {
    margin-top: 10px;
    flex-direction: column;
    align-items: center;
    display: flex;
    gap: 10px;
  }

  .dosbutton-loading-message {

  }
`;
