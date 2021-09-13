import React from 'react';
import styled from 'styled-components';
import Button from './Button';

type Props = {
  className?: string;
  onClick?: any;
}

const SelectAssetButton = ({ className, onClick, children }: React.PropsWithChildren<Props>) => {
  return (
    <Button onClick={onClick} className={className}>
      {children}
      <img alt='expand' style={{ width: 24, height: 24 }} src='/images/icons/expand.svg' />
    </Button>
  );
};

export default styled(SelectAssetButton)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  text-align: right;
  height: 42px;
  width: 100%;

  background: ${props => props.theme.colors.transferPanelBackground};

  border: 1px solid ${props => props.theme.colors.main};
  box-shadow: none;

  font-family: Menlo;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 100%;
  letter-spacing: -0.04em;

  color: ${props => props.theme.colors.secondary};
`;
