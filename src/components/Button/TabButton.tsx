import React from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  selected: boolean;
  onClick?: any;
  disabled?: boolean;
  hidden?: boolean;
}

const TabButton = ({ className, onClick, disabled, children }: React.PropsWithChildren<Props>) => {
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

  background: ${props => props.selected ? props.theme.colors.main : 'transparent'};

  color: ${props => props.selected ? props.theme.colors.panelBackground : props.theme.colors.secondary};

  border-radius: 0px;
  border: none;
  border-bottom: ${props => props.selected ? 'none' : 'solid 2px red'}

  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 100%;
  letter-spacing: -0.04em;

  display: ${props => props.hidden === true ? 'none' : 'flex'};
  align-items: center;
  justify-content: center;

  :disabled {
    opacity: 0.5;
  }

`;
