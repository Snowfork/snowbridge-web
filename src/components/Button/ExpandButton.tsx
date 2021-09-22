import React from 'react';
import styled from 'styled-components';
import FlatButton from './FlatButton';

type Props = {
  className?: string;
  onClick?: any;
}

const ExpandButton = ({ className, onClick, children }: React.PropsWithChildren<Props>) => {
  return (
    <FlatButton onClick={onClick} className={className}>
      {children}
      <img alt='expand' style={{ width: 24, height: 24 }} src='/images/icons/expand.svg' />
    </FlatButton>
  );
};

export default styled(ExpandButton)`
  font-size: 15px;
`;
