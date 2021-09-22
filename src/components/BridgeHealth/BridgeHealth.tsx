import React from 'react'; // we need this to make JSX compile
import styled from 'styled-components';
import Panel from '../Panel/Panel';

type BridgeHealthProps = {
  className?: string
}

export const BridgeHealth = ({ className }: BridgeHealthProps) =>
<div className={className}>
    <Panel className="bridge-health-panel">
      <Panel className='bridge-health'>
        <h2>Health</h2>
        <p>
          Beefy
        </p>
      </Panel>
    </Panel>
</div>

export default styled(BridgeHealth)`
  display: flex;
  align-items: center;
  justify-content: center;

  .bridge-health-panel {
    width: 520px;
    align-items: center;
    gap: 15px;
  
    border: 1px solid ${props => props.theme.colors.transferPanelBorder};
    background: ${props => props.theme.colors.transferPanelBackground};
    margin-bottom: 16px;
  }

  .bridge-health {
    text-align: center;
  }
`;
