import React from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  value: string | number;
  onChange?: any;
}

const Select = ({ className, children, value, onChange }: React.PropsWithChildren<Props>) => {
  return (
    <div className={className}>
      <select value={value} onChange={onChange} id="standard-select">
        {children}
      </select>
      <img alt='expand' className='select-expand-button' src='/images/icons/expand.svg' />
    </div >
  );
};

export default styled(Select)`
  width: 100%;

  border: 1px solid var(--select-border);
  border-radius: 0.25em;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1.1;
  background-color: #fff;
  background-image: linear-gradient(to top, #f9f9f9, #fff 33%);
  height: 42px;
  text-align: right;
  background: ${props => props.theme.colors.transferPanelBackground};
  border: 1px solid ${props => props.theme.colors.main};
  box-shadow: none;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 100%;
  letter-spacing: -0.04em;
  color: ${props => props.theme.colors.secondary};
  display: flex;

  :root {
    --select-border: #777;
    --select-focus: blue;
    --select-arrow: var(--select-border);
  }

  select {
    // A reset of styles, including removing the default dropdown arrow
    appearance: none;

    // Additional resets for further consistency
    background-color: transparent;
    border: none;
    margin: 0;
    width: 100%;
    font-family: inherit;
    font-size: inherit;
    cursor: inherit;
    line-height: inherit;
    outline: none;
    color: ${props => props.theme.colors.main};

    padding: 0px 27px;

  }

  select::-ms-expand {
    display: none;
  }

  .select-expand-button {
    width: 24px;
    height: 24px;
    position: absolute;
    top: calc(50% - 12px);
    right: 5px;
    cursor: pointer;
    pointer-events: none
  }
`;
