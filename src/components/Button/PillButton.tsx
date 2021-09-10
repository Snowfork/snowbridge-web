import React from 'react';
import styled from 'styled-components';
import Button from './Button';

type Props = {
  className?: string;
  onClick?: any;
}

const PillButton = ({ className, onClick, children }: React.PropsWithChildren<Props>) => {
  return (
    <Button onClick={onClick} className={className}>
      {children}
    </Button>
  );
};

export default styled(PillButton)`
  background: ${props => props.theme.colors.panelBackground};
  color: ${props => props.theme.colors.main};

  font-family: SF UI Text;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: -0.04em;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px 10px;

  border: 1px solid ${props => props.theme.colors.main};
  box-sizing: border-box;
  border-radius: 20px;
  box-shadow: none;
`;
