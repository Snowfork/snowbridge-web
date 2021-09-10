import React from 'react';
import styled from 'styled-components';
import Button from './Button';

type Props = {
  className?: string;
  onClick?: any;
}

const SwitchButton = ({ className, onClick }: Props) => {
  return (
    <Button onClick={onClick} className={className}>
      <img style={{ width: 20, height: 20 }} src="/images/icons/switch.svg" alt="Switch" />
    </Button>
  );
};

export default styled(SwitchButton)`
  width: 32px;
  height: 32px;

  .button-frame {
    border: none;
    width: 100%;
    padding: 0px;
  }

`;
