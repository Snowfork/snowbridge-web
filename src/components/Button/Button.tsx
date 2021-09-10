import React from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  onClick?: any;
  disabled?: boolean;
}

const Button = ({ className, onClick, disabled, children }: React.PropsWithChildren<Props>) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}>
      <div className="button-frame">
        {children}
      </div>
    </button>
  );
};

export default styled(Button)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 4px;

  background: ${props => props.theme.colors.main};

  color: ${props => props.theme.colors.panelBackground};

  box-shadow: 8px 8px 0px ${props => props.theme.colors.transferPanelBorder};
  border-radius: ${props => props.theme.borderRadius};
  border: none;

  font-family: Menlo;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: -0.04em;

  width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;

  :disabled {
    opacity: 0.5;
  }

  .button-frame {
    border: 1px solid ${props => props.theme.colors.transferPanelBorder};
    width: calc(100% - 22px);
    padding: 10px;
  }
`;
