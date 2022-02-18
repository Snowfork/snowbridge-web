import React from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';

import Select from '../../Select/Select';
import Option from '../../Select/Option';

import { useAppSelector } from '../../../utils/hooks';
import { setParaChainId, setTransactionFee } from '../../../redux/actions/bridge';
import { PARACHAIN_LIST } from '../../../config';

type ChainDisplayProps = {
  className?: string;
  mini?: boolean;
 
}

const ParachainDisplay = ({  className }: ChainDisplayProps) => {
  
  const dispatch = useDispatch();

  const { parachainId } = useAppSelector((state) => state.bridge);

  const selectParachain = (event:any) => {
    PARACHAIN_LIST.filter((parachain) => {
      if(parachain.parachainId == event.target.value) {
        dispatch(setTransactionFee(parachain.transactionFee));
      }
    })
    dispatch(setParaChainId(event.target.value));
  }

  return (
    <div className={className}>
      <Select value={parachainId} onChange={selectParachain} >
        {PARACHAIN_LIST.map((chain,index) => <Option key={index} value={chain.parachainId} isDisable={chain.isDisabled}>{chain.parachainName}</Option>)}
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
