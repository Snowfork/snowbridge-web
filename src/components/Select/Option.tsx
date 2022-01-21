import React from 'react';
import styled from 'styled-components';

type Props = {
  value: string | number;
  className?: string;
  isDisable?:boolean;
}

const Option = ({ className, value, isDisable, children }: React.PropsWithChildren<Props>) => {
  return (
    <option className={className} value={value} disabled={isDisable}>{children}</option>
  );
};

export default styled(Option)`
`;
