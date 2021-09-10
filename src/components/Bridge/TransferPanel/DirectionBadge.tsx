import React from 'react';
import styled from 'styled-components';

type DirectionBadgeProps = {
  className?: string;
  direction: string,
}

const DirectionBadge = ({ direction, className }: DirectionBadgeProps) => {
  return (
    <span className={className}>
      {direction}
    </span>
  );
}

export default styled(DirectionBadge)`
padding: 2px 4px;

background: ${props => props.theme.colors.main};
color: ${props => props.theme.colors.panelBackground};
border-radius: 2px;

font-family: SF UI Text Regular;
font-style: normal;
font-weight: 500;
font-size: 12px;
line-height: 100%;
letter-spacing: -0.04em;
`;
