import React from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: any;
  type?: string;
  step?: string;
  min?: string;
  lang?: string;
  style?: object;
}

const Input = ({ step, min, lang, className, disabled, placeholder, value, onChange, type, children, style }: React.PropsWithChildren<Props>) => {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      step={step}
      min={min}
      lang={lang}
      disabled={disabled}
      className={className}
      style={style}>
      {children}
    </input>
  );
};

export default styled(Input)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 10px;
  text-align: right;
  height: 24px;

  background: ${props => props.theme.colors.transferPanelBackground};

  border: 1px solid ${props => props.theme.colors.main};
  border-radius:  ${props => props.theme.borderRadius};

  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 100%;
  letter-spacing: -0.04em;

  color: ${props => props.theme.colors.secondary};
`;
