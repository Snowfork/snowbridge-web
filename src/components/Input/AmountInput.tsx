import React from 'react';
import styled from 'styled-components';
import Input from './Input';
import PillButton from '../Button/PillButton';

type Props = {
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: any;
  type?: string;
  onPillClick?: any;
}

const AmountInput = ({ className, disabled, placeholder, value, onChange, type, onPillClick }: React.PropsWithChildren<Props>) => {
  return (
    <span className={className}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        step="0.1"
        min="0"
        disabled={disabled}
        className={className}>
      </Input>
      <PillButton className={'amount-input-pill'} onClick={onPillClick}>MAX</PillButton>
    </span>
  );
};

export default styled(AmountInput)`
  position: relative;
  font-size: 15px;

  .amount-input-pill {
    position: absolute;
    top: 8px;
    left: 10px;
  }

  input {
    padding-left: 64px;
  }
`;
