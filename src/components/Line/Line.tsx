import React from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  width?: string;
  type?: string;
}

const Line = ({ className }: Props) => {
  return <div className={className}></div>;
}

export default styled(Line)`
  height: 2px;
  width: ${props => props.width ? '100%' : '40px'};
  background: ${props => props.type === 'inverted' ? props.theme.colors.main : props.theme.colors.secondary};
  margin: 0 10px;
`;
