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
      {children}
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

  box-shadow: ${props => props.theme.boxShadow};
  border-radius: ${props => props.theme.borderRadius};
  border: none;

  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: -0.04em;

  display: flex;
  align-items: center;
  justify-content: center;

  :disabled {
    opacity: 0.5;
  }

`;
