import React from 'react';
import styled from 'styled-components';
import Button from './Button';

type Props = {
  className?: string;
  onClick?: any;
  disabled?: boolean;
}

const DOSButton = ({ className, onClick, disabled, children }: React.PropsWithChildren<Props>) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={className}>
      <div className="button-frame">
        {children}
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
`;
