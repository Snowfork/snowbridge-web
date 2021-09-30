import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../Icon/Icon';

type Props = {
  text: string;
  className?: string;
  size?: string;
};

function ToolTip({
  text,
  className,
  size = '18px',
}: Props): React.ReactElement<Props> {
  const [showToolTip, setShowToolTip] = useState(false);

  return (
    <div
      className={className}
    >
      <Icon
        size={size}
        name="info"
        className="tooltip-icon"
        onMouseOver={() => setShowToolTip(true)}
        onMouseOut={() => setShowToolTip(false)}
        alt="info"
      />
      {showToolTip
      && (
      <div className="tooltip-overlay">
        <span>{text}</span>
      </div>
      )}
    </div>
  );
}

export default styled(ToolTip)`
  position: relative;

  .tooltip-overlay {
    position: absolute;
    bottom: 15px;
    right: 12px;
    z-index: 999;
    width: fit-content;
    min-width: 175px;
    padding: 5px;
    background: ${(props) => props.theme.colors.transferPanelBackground};
    border: 1px solid ${(props) => props.theme.colors.secondary};
    border-radius: ${(props) => props.theme.colors.secondary};
    font-size: 10px;
    color: ${(props) => props.theme.colors.secondary};
    pointer-events: none;
  }
`;
