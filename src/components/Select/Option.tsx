import React from 'react';
import styled from 'styled-components';

type Props = {
  value: string;
  className?: string;
}

const Option = ({ className, value, children }: React.PropsWithChildren<Props>) => {
  return (
    <option className={className} value={value}>{children}</option>
  );
};

export default styled(Option)`
`;
