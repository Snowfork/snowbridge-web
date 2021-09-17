import React from 'react';
import styled from 'styled-components';

import { Heading } from '../Modal/Modal.style';

type Props = {
  error: string;
  className?: string;
};

function RejectedTransaction({
  error, className
}: Props): React.ReactElement<Props> {
  return (
    <div className={className}>
      <Heading>Error</Heading>
      <h4>Transaction rejected.</h4>
      <p>{error}</p>
    </div>
  );

};

export default styled(RejectedTransaction)`
  background-color: ${props => props.theme.colors.errorBackground};
`;
