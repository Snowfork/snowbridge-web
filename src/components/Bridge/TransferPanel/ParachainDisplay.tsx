import React from 'react';
import styled from 'styled-components';

import Select from '../../Select/Select';
import Option from '../../Select/Option';

type ChainDisplayProps = {
  className?: string;
  mini?: boolean;
 
}
const  onchange = () => {
  //used for change of chain during the dropdown selection
}
const ParachainDisplay = ({  className }: ChainDisplayProps) => {
  
  return (
    <div className={className}>
      <Select value={'Snowbridge'} onChange={onchange} >
        <Option value='Snowbridge'>Snowbridge</Option>
        <Option value='Acala' isDisable={true} >Acala (coming soon...)</Option>
        <Option value='Moonbeam' isDisable={true} >Moonbeam (coming soon...)</Option>
        <Option value='Bifrost' isDisable={true}>Bifrost (coming soon...)</Option>
        <Option value='Kusama' isDisable={true}>Kusama (coming soon...)</Option>
      </Select>
    </div>
  );
}

export default styled(ParachainDisplay)`
  max-width: 200px;
  position: relative;
  color: ${props => props.theme.colors.secondary};
  display: flex;
  flex-direction: ${props => props.mini ? 'column' : 'row'};
  justify-content: left;
  align-items: center;
  font-size: ${props => props.mini ? '10px' : 'undefined'};
  gap: ${props => props.mini ? '5px' : 'undefined'};
`;
