import React from 'react';
import styled from 'styled-components';

type StatusBubbleProps = {
  status: number;
  className?: string;
}

const StatusBubble = ({ className }: StatusBubbleProps) => {
  return (
    <div className={className}>
    </div>
  );
}

export default styled(StatusBubble)`
  width: 8px;
  height: 8px;
  background: ${props => {
    switch (props.status) {
      case 0:
        return props.theme.colors.statusBad;
      case 1:
        return props.theme.colors.statusGood;
    }
  }};

  border-radius: 5px;
  border: solid 1px ${props => props.theme.colors.main};
`;
