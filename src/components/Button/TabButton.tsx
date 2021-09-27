import React from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  selected: boolean;
  onClick?: any;
  disabled?: boolean;
}

const TabButton = ({ className, selected, onClick, disabled, children }: React.PropsWithChildren<Props>) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}>
      {children}
    </button>
  );
};

export default styled(TabButton)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 4px;
  gap: 10px;

  box-sizing: border-box;
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.4);
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.colors.panelBorder};
  background: ${props => props.selected ? props.theme.colors.secondary : props.theme.colors.panelBackground };

  width: 100%;

  color: ${props => props.selected ? props.theme.colors.panelBackground : props.theme.colors.secondary };

  border-bottom: ${props => props.selected ? 'none' : 'solid 2px red'}

  font-family: Menlo;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 100%;
  letter-spacing: -0.04em;

  display: flex;
  align-items: center;
  justify-content: center;

  :disabled {
    opacity: 0.5;
  }

`;
